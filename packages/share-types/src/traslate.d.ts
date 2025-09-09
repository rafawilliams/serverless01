export type ITranslateRequest = {
    sourceLang: string;
    targetLang: string;
    text: string;
};
export type ITranslateResponse = {
    timestamp: string;
    translatedText: string;
};

export type ITranslateDbObject = ITranslateRequest & ITranslateResponse & {
    id: string;
};
