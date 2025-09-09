import * as dynamodb from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb"
import * as lambda from "aws-lambda";
import { gateway, createTranslate, exception } from "/opt/nodejs/utils-lambda-layer";

import { ITranslateDbObject, ITranslateRequest, ITranslateResponse } from "@sff/share-types";


const ddbClient = new dynamodb.DynamoDBClient({ region: "us-east-1" });

const { TABLE_NAME, TRANSLATION_PARTITION_KEY} = process.env;

export const handler: lambda.APIGatewayProxyHandler = async (event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) => {
  try {
    if(!event.body){
      throw new exception.MissingBodyException();
    }
    let body = JSON.parse(event.body) as ITranslateRequest;

    if(!body.text){
      throw new exception.MissingParameters("text");
    }
    
    const { sourceLang, targetLang, text } = body;
    const now: string = new Date(Date.now()).toString();

    const response = await createTranslate({sourceLang, targetLang, text});
    
    if(!response.TranslatedText){
      throw new Error("Translation service did not return any text");
    }

    const rtnDate: ITranslateResponse = {
      timestamp: now,
      translatedText: response.TranslatedText || "No translation available",
    }
    const tableObj: ITranslateDbObject = {
      id: context.awsRequestId,
      ...body, ...rtnDate };

    // Save to DynamoDB
    const putItemCmd = new dynamodb.PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(tableObj),
    });
    await ddbClient.send(putItemCmd)
    return gateway.createSuccessJsonResponse(rtnDate);

  } catch (e: any) {
    console.error(e);
    return gateway.createErrorJsonResponse({ message: e.toString() || "Error processing the request" });

  }
};


export const getTranslations: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
)  {

  try {

  //get all items from DynamoDB
  const getAll = new dynamodb.ScanCommand({
    TableName: TABLE_NAME
  });
  const allItems = await ddbClient.send(getAll);

  const items = allItems.Items ? allItems.Items.map((item) => unmarshall(item) as ITranslateDbObject) : [];
  return gateway.createSuccessJsonResponse(items);
  
  }catch (e: any) {
      console.error(e);
      return gateway.createErrorJsonResponse({ message: e.toString() || "Error processing the request" });
  }
};