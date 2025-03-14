import i18next from "i18next";
import { z } from "zod";
import { makeZodI18nMap } from "zod-i18n-map";
// Import your language translation files
import translation from "zod-i18n-map/locales/zh-tw/zod.json";

// zod 在地化
// https://github.com/aiji42/zod-i18n
// lng and resources key depend on your locale.
i18next.init({
  lng: "zh_tw",
  resources: {
    zh_tw: { 
      zod: translation,
      custom: { // 自訂錯誤訊息
        string_is_empty: "{{path}}為必填的欄位",
        paths: { // 欄位名稱前綴
          name: "使用者名稱",
          password: "密碼",
          email: "電子郵件",
        }
      },
    },
  },
});
z.setErrorMap(makeZodI18nMap({ 
  ns: ["zod", "custom"],
  handlePath: {
    keyPrefix: "paths",
  },
}));

// export configured zod instance
export { z }