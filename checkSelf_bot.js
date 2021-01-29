const FS = FileStream;
const path = '/sdcard/bot/selfcheck.txt';

if (!FS.read(path)) FS.write(path, "[]");
const CovidVirusCheck = {
    setting: JSON.parse(FS.read(path)),
    baseURL: "",
    schoolCode: ""
};

setschul('학교명', '지역');

const key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA81dCnCKt0NVH7j5Oh2+SGgEU0aqi5u6sYXemouJWXOlZO3jqDsHYM1qfEjVvCOmeoMNFXYSXdNhflU7mjWP8jWUmkYIQ8o3FGqMzsMTNxr+bAp0cULWu9eYmycjJwWIxxB7vUwvpEUNicgW7v5nCwmF5HS33Hmn7yDzcfjfBs99K5xJEppHG0qc+q3YXxxPpwZNIRFn0Wtxt0Muh1U8avvWyw03uQ/wMBnzhwUC8T4G5NclLEWzOQExbQ4oDlZBv8BM/WxxuOyu0I8bDUDdutJOfREYRZBlazFHvRKNNQQD2qDfjRz484uFs7b5nykjaMB9k/EJAuHjJzGs9MMMWtQIDAQAB";

function response(h, a, t, s, u, n, e) {
    if (a === "/자가진단") {
        var result = new Array();
        for (i = 0; i < CovidVirusCheck.setting.length; i++) {
            result[i] = (i + 1) + "번 " + CovidVirusCheck.setting[i].Name + "\n" + doSubmit() + "\n\n";
        }
        var res = '';
        for (i = 0; i < CovidVirusCheck.setting.length; i++) {
            res += result[i];
        }
        u.reply("<자가진단 결과>" + "\u200b".repeat(500) + "\n" + res);
    }
    if (a.startsWith('/추가')) {
        var str = a.substr(4).split('/');
        CovidVirusCheck.setting.push({
            "Name": str[0],
            "myName": encrypt(str[0]),
            "myBirth": encrypt(str[1]),
            "passWord": str[2]
        })
        u.reply(str[0] + '님 등록 완료');
        FS.write(path, JSON.stringify(CovidVirusCheck.setting, null, 4));
    }
}

importClass(org.jsoup.Jsoup);

function encrypt(str) {
    let keyByte = android.util.Base64.decode(key, android.util.Base64.NO_WRAP);
    let keyFactory = java.security.KeyFactory.getInstance("RSA");
    let pubKey = keyFactory.generatePublic(new java.security.spec.X509EncodedKeySpec(keyByte));
    let cipher = javax.crypto.Cipher.getInstance("RSA/None/PKCS1Padding");
    cipher.init(javax.crypto.Cipher.ENCRYPT_MODE, pubKey);
    let byte = cipher.doFinal(new java.lang.String(str).getBytes("UTF-8"));
    let result = android.util.Base64.encodeToString(byte, android.util.Base64.NO_WRAP);
    return result;
    }

function setschul(schulNm, geoNm) {
    var res = JSON.parse(org.jsoup.Jsoup.connect('http://193.123.246.37/api')
        .data("schulNm", schulNm)
        .data("geoNm", geoNm)
        .ignoreContentType(true).get().text());
    if (!res.url) throw new Error(res.schulNm);
    CovidVirusCheck.baseURL = res.url;
    CovidVirusCheck.schoolCode = res.schulCode;
    Log.i('설정 학교:' + res.schulNm);
}

function doSubmit(token) {
    let token1 = JSON.parse(Jsoup.connect(CovidVirusCheck.baseURL + 'v2/findUser').header(
        "Content-Type", "application/json;charset=UTF-8"
    ).requestBody(JSON.stringify({
        "orgCode": CovidVirusCheck.schoolCode,
        "name": CovidVirusCheck.setting[i].myName,
        "birthday": CovidVirusCheck.setting[i].myBirth,
        "loginType": "school"
    })).ignoreContentType(true).ignoreHttpErrors(true).post().text()).token;
    let token2 = JSON.parse(Jsoup.connect(CovidVirusCheck.baseURL + 'v2/validatePassword').header(
        "Content-Type", "application/json"
    ).header(
        "Authorization", token1
    ).requestBody(JSON.stringify({
        'password': encrypt(CovidVirusCheck.setting[i].passWord)
    })).ignoreContentType(true).ignoreHttpErrors(true).post().text());
    return Jsoup.connect(CovidVirusCheck.baseURL + 'registerServey').header(
        "Content-Type", "application/json"
    ).header(
        "Authorization", token2
    ).requestBody(JSON.stringify({
        "rspns01": "1",
        "rspns02": "1",
        "rspns09": "0",
        "rspns00": "Y",
        'upperToken': token2,
        'upperUserNameEncpt': CovidVirusCheck.setting[i].Name
    })).ignoreContentType(true).ignoreHttpErrors(true).post().text();
}
