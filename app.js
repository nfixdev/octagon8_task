const telebot = require('node-telegram-bot-api')
const token = '6802319674:AAG3mBMojhnyMZfMZ940IAqo2cnCm7w90bI'
const bot = new telebot(token, {polling: true})
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async')

const {CronJob} = require('cron')

const mysql2 = require("mysql2");

const connection = mysql2.createConnection({
    host: "localhost",
    user: "root",
    database: "chatbottests",
    password: ''
});

connection.connect(function(err){
    if(err){
        return console.error("Ошибка: " + err.message);
    }
    else{
        console.log("Подключение к серверу установленно");
    }
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// minute hour day(month) month day(week)
const job = new CronJob(
	'00 13 * * *', // cronTime
	function () {
        let date1 = new Date();
		connection.query('select * from users', function(_, result){
            let date1 = new Date();
            connection.query('select * from users', function(_, result){
                let arr = []
                for(const rec of result) { arr.push(rec); }
                for(let record of result) {
                    let date2 = new Date(record.lastMessage);
                    let diff=date1.getTime()-date2.getTime();
                    let diff_inDay = Math.round(diff / (1000 * 3600 * 24));
                    console.log(diff_inDay)
                    if(diff_inDay>2){
                        let randomItem = arr[getRandomInt(0, result.length-1)]
                        bot.sendMessage(record.ID, `${randomItem.ID}-${randomItem.lastMessage}`);
                    }
                }
            });
        });
	}, // onTick
	null, // onComplete
	true, // start
	'Europe/Moscow' // timeZone
)

bot.on('message', function(msg){
    let d = new Date(msg.date*1000);
    const id = msg.from.id
    connection.query("select * from users where id=?", [id], function(_, result){
        if(result.length==0){
            connection.query('insert users(ID, lastMessage) values(?, ?)', [id, `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}`]);
        }
        else{
            connection.query('update users set lastMessage=? where id=?', [`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}`, id]);
        }
    })
})