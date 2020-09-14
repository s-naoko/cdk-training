import boto3
import json

S3 = boto3.client('s3')
DYNAMO = boto3.resource('dynamodb')
TABLE = DYNAMO.Table('TABLE_NAME')


def handler(event, _):
    try:
        print(event)
        for record in event.get("Records"):
            key_name = record.get('s3').get('object').get('key')
            file_str = (
                S3.get_object(Bucket='BUCKET_NAME', Key=key_name)['Body']
                .read()
                .decode()
            )
            file_json = json.loads(file_str)
            if isinstance(file_json, list):
                for item in file_json:
                    TABLE.put_item(Item=item)
            elif isinstance(file_json, dict):
                TABLE.put_item(Item=file_json)
    except Exception as err:
        print(err)
        return None
