const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        //slowMo: 350,
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    var argv = require('yargs').argv;
    await page.setViewport({
        width: argv.width,
        height: argv.height
    });
    await page.goto(argv.url, {waitUntil: 'load', timeout: 5000});
    //通过等待,而不是走showMo模式,vue可以比较快的出图
    await page.waitFor(500);
    await page.screenshot({path: argv.path});
    await browser.close();
    console.log("finish");
})();
