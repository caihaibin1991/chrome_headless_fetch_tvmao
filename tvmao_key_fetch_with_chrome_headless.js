//编辑器用 visual studio code
//F5 运行 
//chrome 打开 headless 模式:
//chrome.exe --headless --disable-gpu  --remote-debugging-port=9222
//浏览器输入 chrome://inspect/

const CDP = require('chrome-remote-interface');
const fs = require('fs');

const blacklistURLs = [
  '*.png*',
  '*.jpg*',
  '*.css*',
  '*.gif*',
  // 'https://cdn.segment.com/analytics.js/v1/oD9PafeNRrJRbC3NL41R8DgV8SANLDZ9/analytics.min.js', - already skipped with wildcard '*segment.com*',
];
CDP.Version(function (err, info) {
  if (!err) {
    console.log(info);
  }
});

CDP(client => {
  // extract domains
  const { Network, Page, DOM, CSS,Runtime } = client;
  // setup handlers

  //Network.setBlockedURLs({ urls: blacklistURLs });



  Network.setBlockedURLs({ urls: blacklistURLs });
  // Network.requestWillBeSent(params => {
  //   const url = params.request.url;
  //   console.log(`-> ${params.requestId} ${url.substring(0, 150)}`);
  //   blacklistURLs.some(blacklistedURL => {
  //     if (url.indexOf(blacklistedURL) !== -1) {
  //       Network.addBlockedURL(url);
  //       console.log('BLOCKING', url, '(I hope)');
  //       return true;
  //     }
  //     return false;
  //   });
  // });
  Network.loadingFailed(params => {
    console.log('*** loadingFailed: ', params.requestId);
  })
  Network.requestWillBeSent((params) => {
    //Network.addBlockedURL(params.request.url);
    //用户判断 block url 设置的效果.如果有特殊链接没有过滤,需要进行单独设置,或者根据判断.补充addBlockedURL进行屏蔽
    console.log(params.requestId, params.request.url);
  });
  Network.loadingFinished(params => {
    console.log('<-', params.requestId, params.encodedDataLength);
  })
  //Page.addScriptToEvaluateOnLoad("http://you.api/test.js");
  Page.loadEventFired(() => {
    console.log('loadEventFired!'); console.log(DOM.resolveNode); console.log(DOM.getDocument());
    Runtime.evaluate({
      // 两种写法
      // expression:'document.getElementById("kw").value = "Web自动化 headless chrome"',
      expression: 'A.d("","src")'
    }).then(({result}) => {
      console.log("电视猫,密钥:",result.value);
    });

    //
    //promise 语法 (回调)
    //获取根节点对象.
    DOM.getDocument().then(({ root }) => {
      console.log(root.nodeId);
      DOM.querySelector({
        nodeId: root.nodeId,
        selector: '#searchform'
      }).then(({ nodeId }) => {
        console.log(nodeId);
      });
    });
    // client.DOM.querySelector('body').then(doc=>{
    //   console.log(doc);
    // })
    //Page.addScriptToEvaluateOnLoad
    //Page.addScriptToEvaluateOnNewDocument
    //.then(res => res.root.nodeId)
    //.then(nodeId => DOM.querySelector({ selector: '.btn-primary', nodeId }))
    //Page.getDocument().resolveNode
    //Page.captureScreenshot().then(v => {
    //  let filename = `screenshot-${Date.now()}`;
    //  fs.writeFileSync(filename + '.png', v.data, 'base64');
    //  console.log(`Image saved as ${filename}.png`);
    //client.close();
    //});
  });
  // enable events then start!
  Promise.all([
    Network.enable(),
    Page.enable(),
    DOM.enable(),
    Runtime.enable()
  ]).then(
    () => {
      return Page.navigate({ url: 'http://www.tvmao.com/program/CCTV-CCTV1-w3.html' });
    },
    () => {
      console.log('REJECT');
      client.close();
    }
    );
}).on('error', (err) => {
  console.error('Cannot connect to remote endpoint:', err);
});