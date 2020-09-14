import cdk = require("@aws-cdk/core");
import lambda = require("@aws-cdk/aws-lambda");
import logs = require("@aws-cdk/aws-logs");
import s3Notice = require("@aws-cdk/aws-s3-notifications");
import { Runtime, Code } from "@aws-cdk/aws-lambda";
import { Duration, RemovalPolicy } from "@aws-cdk/core";
import { Table, AttributeType } from "@aws-cdk/aws-dynamodb";
import { PolicyStatement } from "@aws-cdk/aws-iam";
import { Bucket, EventType } from "@aws-cdk/aws-s3";

export class TrainingStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        // バケットの作成
        const bucket: Bucket = new Bucket(this, "createBucket", {
            bucketName: "cdk-training-your-name",
            removalPolicy: RemovalPolicy.DESTROY,
        });
        // テーブルの作成
        const table: Table = new Table(this, "createTable", {
            tableName: "s3_data_YOUR-NAME",
            partitionKey: {
                name: "id",
                type: AttributeType.STRING,
            },
            sortKey: {
                name: "record_time",
                type: AttributeType.STRING,
            },
            writeCapacity: 2,
            readCapacity: 2,
            removalPolicy: RemovalPolicy.DESTROY,
        });
        // テーブルにautoscaleの設定をする
        const readScale = table.autoScaleReadCapacity({
            minCapacity: 1,
            maxCapacity: 5,
        });
        readScale.scaleOnUtilization({ targetUtilizationPercent: 90 });
        const writeScale = table.autoScaleWriteCapacity({
            minCapacity: 1,
            maxCapacity: 5,
        });
        writeScale.scaleOnUtilization({ targetUtilizationPercent: 90 });
        // lambdaの作成
        const lambdaFunction: lambda.Function = new lambda.Function(
            this,
            "createLambdaFunction",
            {
                functionName: "put_data_from_s3_YOUR_NAME",
                runtime: Runtime.PYTHON_3_8,
                handler: "index.handler",
                code: Code.fromAsset("resources/put_s3_data"),
                description:
                    "BUCKET_NAMEに保存されたjsonをdynamoに保存する関数",
                timeout: Duration.seconds(30),
                memorySize: 128,
                logRetention: logs.RetentionDays.ONE_WEEK,
                initialPolicy: [
                    new PolicyStatement({
                        actions: ["dynamodb:PutItem"],
                        resources: [table.tableArn],
                    }),
                    new PolicyStatement({
                        actions: ["s3:GetObject"],
                        resources: [`${bucket.bucketArn}/*`],
                    }),
                ],
            }
        );
        // バケットにlambdaを紐付ける
        bucket.addEventNotification(
            EventType.OBJECT_CREATED,
            new s3Notice.LambdaDestination(lambdaFunction),
            { suffix: ".json" }
        );
    }
}
