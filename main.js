import puppeteer from 'puppeteer';
import mysql from 'mysql';

(async function () {
    const browser = await puppeteer.launch({
        defaultViewport: null
    });
    const page = await browser.newPage();
    await page.goto('https://csgoempire.com/');

    const db_config = {
        host: 'db_host',
        user: 'db_user',
        password: 'password',
        database: 'database'
    };

    let connection = mysql.createConnection(db_config);
    connection.connect(err => err);

    const parcial_counter = {
        "coin-t": 0,
        "coin-ct": 0,
        "coin-bonus": 0,
    };

    while (true) {
        //----------------------------------------//
        //Primeiro evento: coletar dados pré-sorteio
        try {
            await page.waitForSelector('.bets-container--rolling');
        } catch (err) {
            //No caso de acontecer um erro, desconsiderar a roll
            continue;
        }

        //Data completa em que o roll atual aconteceu
        let time = new Date().getTime();

        //Total de cash apostado para cada coin
        let coin_ct_cash_vol = await page.evaluate("parseInt(document.querySelector('#page-scroll > div.page-layout__inner > div > div > div.bet-containers.w-full.mb-6 > div:nth-child(1) > div > div.h-40.flex.items-center.justify-between.px-3.text-light-grey-2.text-xs.cursor-pointer > div.flex.items-center.transition > span').innerText.replace(/,/g,''))");
        let coin_bonus_cash_vol = await page.evaluate("parseInt(document.querySelector('#page-scroll > div.page-layout__inner > div > div > div.bet-containers.w-full.mb-6 > div:nth-child(2) > div > div.h-40.flex.items-center.justify-between.px-3.text-light-grey-2.text-xs.cursor-pointer > div.flex.items-center.transition > span').innerText.replace(/,/g,''))");
        let coin_t_cash_vol = await page.evaluate("parseInt(document.querySelector('#page-scroll > div.page-layout__inner > div > div > div.bet-containers.w-full.mb-6 > div:nth-child(3) > div > div.h-40.flex.items-center.justify-between.px-3.text-light-grey-2.text-xs.cursor-pointer > div.flex.items-center.transition > span').innerText.replace(/,/g,''))");

        //Total de apostas para cada coin
        let coin_ct_bet_vol = await page.evaluate("parseInt(document.querySelector('#page-scroll > div.page-layout__inner > div > div > div.bet-containers.w-full.mb-6 > div:nth-child(1) > div > div.h-40.flex.items-center.justify-between.px-3.text-light-grey-2.text-xs.cursor-pointer > div:nth-child(1)').innerText.split(' ')[0])");
        let coin_bonus_bet_vol = await page.evaluate("parseInt(document.querySelector('#page-scroll > div.page-layout__inner > div > div > div.bet-containers.w-full.mb-6 > div:nth-child(2) > div > div.h-40.flex.items-center.justify-between.px-3.text-light-grey-2.text-xs.cursor-pointer > div:nth-child(1)').innerText.split(' ')[0])");
        let coin_t_bet_vol = await page.evaluate("parseInt(document.querySelector('#page-scroll > div.page-layout__inner > div > div > div.bet-containers.w-full.mb-6 > div:nth-child(3) > div > div.h-40.flex.items-center.justify-between.px-3.text-light-grey-2.text-xs.cursor-pointer > div:nth-child(1)').innerText.split(' ')[0])");

        //---------------------------------------------//
        //Segundo evento: coletar o resultado do sorteio
        try {
            await page.waitForSelector('.previous-rolls-move');
        } catch (err) {
            //No caso de acontecer um erro, desconsiderar a roll
            continue;
        }

        //Aguardar o término da animação e então coletar a última moeda sorteada
        await sleep(3000);
        let class_name = await page.evaluate("document.querySelectorAll('.previous-rolls-item > div')[9].classList['5']");
        
        //Incrementa no contador parcial a moeda sorteada
        parcial_counter[class_name]++;

        //---------------------------------------------//


        //Graves os dados coletados no banco de dados
        const add_item_query = "INSERT INTO rolls (coin, cash_count_t, cash_count_ct, cash_count_bonus, bet_count_t, bet_count_ct, bet_count_bonus, roll_timestamp) VALUES ?"
        const row = [class_name, coin_t_cash_vol, coin_ct_cash_vol, coin_bonus_cash_vol, coin_t_bet_vol, coin_ct_bet_vol, coin_bonus_bet_vol, time, parcial_counter["coin-t"], parcial_counter["coin-ct"], parcial_counter["coin-bonus"]];
        connection.query(add_item_query, [[row]], (err) => {
            if (err) {
                connection.rollback();
                throw err;
            }
            connection.commit((err) => {
                if (err) {
                    connection.rollback();
                    throw err;
                }
            });
        })
    }

})();

async function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}