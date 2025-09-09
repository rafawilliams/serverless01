import * as lambda from "aws-lambda";
import { gateway, createTranslate, exception, TranslationTable } from "/opt/nodejs/utils-lambda-layer";
import { ITranslateDbObject, ITranslateRequest, ITranslateResponse } from "@sff/share-types";

const { TABLE_NAME, TRANSLATION_PARTITION_KEY} = process.env;

const translationTable = new TranslationTable(TABLE_NAME,'id');

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
    await translationTable.insert(tableObj);
    
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

  const items = await translationTable.getAll();
  return gateway.createSuccessJsonResponse(items);
  
  }catch (e: any) {
      console.error(e);
      return gateway.createErrorJsonResponse({ message: e.toString() || "Error processing the request" });
  }
};