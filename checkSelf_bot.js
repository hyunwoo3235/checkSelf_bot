const FS = FileStream;
const path = '/sdcard/bot/selfcheck.txt';

if (!FS.read(path)) FS.write(path, "[]");
const CovidVirusCheck = {
    setting: JSON.parse(FS.read(path)),
    baseURL: "",
    schoolCode: ""
};

setschul('학교명', '지역');

function response(h, a, t, s, u, n, e) {
    if (a === "/자가진단") {
        var result = new Array();
        for (i = 0; i < CovidVirusCheck.setting.length; i++) {
            result[i] = (i + 1) + "번 " + CovidVirusCheck.setting[i].Name + "\n" + doSubmit(doLogin()) + "\n\n";
        }
        var res = '';
        for (i = 0; i < CovidVirusCheck.setting.length; i++) {
            res += result[i];
        }
        u.reply("<자가진단 결과>" + "\u200b".repeat(500) + "\n" + res);
    }
    if (a.startsWith('/추가')) {
        var str = a.substr(4).split('/');
        var data = encrypt(str[0], str[1]);
        CovidVirusCheck.setting.push({
            "Name": str[0],
            "myName": data.pName,
            "myBirth": data.frnoRidno
        })
        u.reply(str[0] + '님 등록 완료');
        FS.write(path, JSON.stringify(CovidVirusCheck.setting, null, 4));
    }
}

importClass(org.jsoup.Jsoup);

function encrypt(pName, frnoRidno) {
    return JSON.parse(org.jsoup.Jsoup.connect('http://hw3235.herokuapp.com')
        .data("pName", pName)
        .data("frnoRidno", frnoRidno)
        .ignoreContentType(true).get().text());
}

function setschul(schulNm, geoNm) {
    var res = JSON.parse(org.jsoup.Jsoup.connect('http://hw3235.herokuapp.com')
        .data("schulNm", schulNm)
        .data("geoNm", geoNm)
        .ignoreContentType(true).get().text());
    if (!res.url) throw new Error(res.schulNm);
    CovidVirusCheck.baseURL = res.url;
    CovidVirusCheck.schoolCode = res.schulCode;
    Log.i('설정 학교:' + res.schulNm);
}

function doLogin() {
    var result = Jsoup.connect(CovidVirusCheck.baseURL + 'v2/findUser').header(
        "Content-Type", "application/json;charset=UTF-8"
    ).requestBody(JSON.stringify({
        "orgCode": CovidVirusCheck.schoolCode,
        "name": CovidVirusCheck.setting[i].myName,
        "birthday": CovidVirusCheck.setting[i].myBirth,
        "loginType": "school",
        "stdntPNo": ""
    })).ignoreContentType(true).ignoreHttpErrors(true).post().text();
    return JSON.parse(result).token;
}

function doSubmit(token) {
    return Jsoup.connect(CovidVirusCheck.baseURL + 'registerServey').header(
        "Content-Type", "application/json"
    ).header(
        "Authorization", token
    ).requestBody(JSON.stringify({
        "rspns01": "1",
        "rspns02": "1",
        "rspns09": "0",
        "rspns00": "Y",
        "deviceuuid": "",
        'upperToken': token,
        'upperUserNameEncpt': CovidVirusCheck.setting[i].Name
    })).ignoreContentType(true).ignoreHttpErrors(true).post().text();
}
