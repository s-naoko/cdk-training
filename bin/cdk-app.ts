import cdk = require("@aws-cdk/core");
const app: cdk.App = new cdk.App();
const regionList: { [key: string]: string } = {
    tokyo: "ap-northeast-1",
    virginia: "us-east-1",
    oregon: "us-west-2",
};

app.synth();
