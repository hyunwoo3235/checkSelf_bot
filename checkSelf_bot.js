const FS = FileStream;
const path = '/sdcard/bot/selfauto.txt';

var i = 0;
if (!FS.read(path)) FS.write(path, "[]");
const CovidVirusCheck = {
    setting: JSON.parse(FS.read(path)),
    baseURL: "",
    schoolCode: ""
};

setschul('학교명', '지역');

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (msg === "/자가진단") { //Made By EliF(원출처) 수정: 자전거515
        var result = new Array();
        for (i = 0; i < CovidVirusCheck.setting.length; i++) {
            result[i] = (i + 1) + "번\n" + doSubmit(doLogin()) + "\n\n";
        }
        var res = '';
        for (i = 0; i < CovidVirusCheck.setting.length; i++) {
            res += result[i];
        }
        replier.reply("<자가진단 결과>" + "\u200b".repeat(500) + "\n" + res);
    }
    if (msg.startsWith('/추가')) {
        var str = msg.substr(4).split('/');
        var data = encrypt(str[0], str[1]);
        CovidVirusCheck.setting.push({
            "myName": data.pName,
            "myBirth": data.frnoRidno
        })
        replier.reply(str[0] + '님 등록 완료');
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
    var result = Jsoup.connect(CovidVirusCheck.baseURL + 'loginwithschool').header(
        "Content-Type", "application/json"
    ).requestBody(JSON.stringify({
        "orgcode": CovidVirusCheck.schoolCode,
        "name": CovidVirusCheck.setting[i].myName,
        "birthday": CovidVirusCheck.setting[i].myBirth
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
        "rspns07": "0",
        "rspns08": "0",
        "rspns09": "0",
        "rspns00": "Y",
        "deviceuuid": ""
    })).ignoreContentType(true).ignoreHttpErrors(true).post().text();
}
