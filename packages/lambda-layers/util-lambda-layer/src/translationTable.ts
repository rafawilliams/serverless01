import * as dynamodb from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb"
import { ITranslateDbObject} from "@sff/share-types";

export class TranslationTable {
    tableName: string;
    partitionKey: string;
    ddbClient: dynamodb.DynamoDBClient;

    constructor(tableName: string, partitionKey: string) {
        this.tableName = tableName;
        this.partitionKey = partitionKey;
        this.ddbClient = new dynamodb.DynamoDBClient({ region: "us-east-1" });
    }

    async insert(tableObj: ITranslateDbObject, ) {
       
        const putItemCmd = new dynamodb.PutItemCommand({
            TableName: this.tableName,
            Item: marshall(tableObj),
        });
        return await this.ddbClient.send(putItemCmd);
    }

    async getAll() {
        const scanCmd = new dynamodb.ScanCommand({
            TableName: this.tableName,
        });
        const data = await this.ddbClient.send(scanCmd);
        if(!data.Items) return [];
        const items = data.Items ? data.Items.map((item) => unmarshall(item) as ITranslateDbObject) : [];
        return items;
    }


}