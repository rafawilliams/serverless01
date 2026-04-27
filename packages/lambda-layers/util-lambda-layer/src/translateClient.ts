import { ITranslateRequest } from '@sff/share-types';
import * as clientTranslate from "@aws-sdk/client-translate";


export async function createTranslate(  
  {sourceLang, targetLang, text}: ITranslateRequest
) {
const translate = new clientTranslate.TranslateClient({ region: "us-east-1" });

const translateCmd = new clientTranslate.TranslateTextCommand({
      SourceLanguageCode: sourceLang || "en",
      TargetLanguageCode: targetLang || "es",
      Text: text,
    });

 const response: clientTranslate.TranslateTextCommandOutput = await translate.send(translateCmd);
 return response;
 }