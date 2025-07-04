"use strict";

// TODO especificar o parametro HL para aprimorar a detecção de idioma
//TODO desativar o botão caso a pagina esteja traduzida

var translateSelected = {};

function getTabHostName() {
  return new Promise((resolve) =>
    chrome.runtime.sendMessage({ action: "getTabHostName" }, (result) => {
      checkedLastError();

      resolve(result);
    })
  );
}

Promise.all([twpConfig.onReady(), getTabHostName()]).then(function (_) {
  const tabHostName = _[1];

  let gSelectionInfo;
  let prevSelectionInfo;

  let divElement;
  let eButtonTransSelText;
  let eDivResult;
  let eSelTextTrans;
  let eOrigText;
  let origTextContainer;

  let originalTabLanguage = "und";
  let currentTargetLanguages = twpConfig.get("targetLanguages");
  let currentTargetLanguage = twpConfig.get("targetLanguageTextTranslation");
  let currentTextTranslatorService = twpConfig.get("textTranslatorService");
  let awaysTranslateThisSite =
    twpConfig.get("alwaysTranslateSites").indexOf(tabHostName) !== -1;
  let translateThisSite =
    twpConfig.get("neverTranslateSites").indexOf(tabHostName) === -1;
  let translateThisLanguage =
    twpConfig.get("neverTranslateLangs").indexOf(originalTabLanguage) === -1;
  let showTranslateSelectedButton = twpConfig.get(
    "showTranslateSelectedButton"
  );
  let dontShowIfIsNotValidText = twpConfig.get("dontShowIfIsNotValidText");
  let dontShowIfPageLangIsTargetLang = twpConfig.get(
    "dontShowIfPageLangIsTargetLang"
  );
  let dontShowIfPageLangIsUnknown = twpConfig.get(
    "dontShowIfPageLangIsUnknown"
  );
  let dontShowIfSelectedTextIsTargetLang = twpConfig.get(
    "dontShowIfSelectedTextIsTargetLang"
  );
  let dontShowIfSelectedTextIsUnknown = twpConfig.get(
    "dontShowIfSelectedTextIsUnknown"
  );
  let fooCount = 0;

  pageTranslator.onGetOriginalTabLanguage(function (tabLanguage) {
    originalTabLanguage = tabLanguage;
    translateThisLanguage =
      twpConfig.get("neverTranslateLangs").indexOf(originalTabLanguage) === -1;
    updateEventListener();
  });

  async function detectTextLanguage(text) {
    if (!chrome.i18n.detectLanguage) return "und";

    return await new Promise((resolve) => {
      chrome.i18n.detectLanguage(text, (result) => {
        if (!result) return resolve({ lang: "und", isReliable: false });

        for (const langInfo of result.languages) {
          const langCode = twpLang.fixTLanguageCode(langInfo.language);
          if (langCode) {
            return resolve({ lang: langCode, isReliable: result.isReliable });
          }
        }

        return resolve({ lang: "und", isReliable: false });
      });
    });
  }

  let isPlayingAudio = false;

  function playAudio(text, targetLanguage, cbOnEnded = () => {}) {
    isPlayingAudio = true;
    chrome.runtime.sendMessage(
      {
        action: "textToSpeech",
        text,
        targetLanguage,
      },
      () => {
        checkedLastError();

        isPlayingAudio = false;
        cbOnEnded();
      }
    );
  }

  function stopAudio() {
    if (!isPlayingAudio) return;
    isPlayingAudio = false;
    chrome.runtime.sendMessage(
      {
        action: "stopAudio",
      },
      checkedLastError
    );
  }

  function dragElement(elmnt, elmnt2) {
    var pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    if (elmnt2) {
      elmnt2.addEventListener("mousedown", dragMouseDown);
    } else {
      elmnt.addEventListener("mousedown", dragMouseDown);
    }

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.addEventListener("mouseup", closeDragElement);
      // call a function whenever the cursor moves:
      document.addEventListener("mousemove", elementDrag);
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt.style.top =
        Math.min(
          window.innerHeight - parseInt(getComputedStyle(elmnt).height),
          Math.max(0, elmnt.offsetTop - pos2)
        ) + "px";
      elmnt.style.left = Math.max(0, elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
      // stop moving when mouse button is released:
      document.removeEventListener("mouseup", closeDragElement);
      document.removeEventListener("mousemove", elementDrag);
    }
  }

  function setCaretAtEnd() {
    const el = eOrigText;
    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(el, el.textContent.length > 0 ? 1 : 0);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus();
  }

  let onCSSLoad = null;
  let isCSSLoaded = false;
  let shadowRoot = null; // Global shadowRoot reference

  function init() {
    destroy();

    window.isTranslatingSelected = true;

    divElement = document.createElement("div");
    divElement.style = "all: initial";
    divElement.classList.add("notranslate");

    shadowRoot = divElement.attachShadow({
      mode: "closed",
    });

    shadowRoot.innerHTML = `
        <div id="eButtonTransSelText" style="display: none"></div>
		<div id="eDivResult" style="display: none">
			<div id="origTextContainer">
				<div>
					<div id="eOrigText" contentEditable="true" spellcheck="false" dir="auto"></div>
					<hr>
				</div>
				<ul><li title="Listen" data-i18n-title="btnListen" id="listenOriginal">
					<svg id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="10px" height="10px" viewBox="0 0 93.038 93.038"
						style="enable-background:new 0 0 93.038 93.038;" xml:space="preserve">
					<g>
						<path d="M46.547,75.521c0,1.639-0.947,3.128-2.429,3.823c-0.573,0.271-1.187,0.402-1.797,0.402c-0.966,0-1.923-0.332-2.696-0.973
						l-23.098-19.14H4.225C1.892,59.635,0,57.742,0,55.409V38.576c0-2.334,1.892-4.226,4.225-4.226h12.303l23.098-19.14
						c1.262-1.046,3.012-1.269,4.493-0.569c1.481,0.695,2.429,2.185,2.429,3.823L46.547,75.521L46.547,75.521z M62.784,68.919
						c-0.103,0.007-0.202,0.011-0.304,0.011c-1.116,0-2.192-0.441-2.987-1.237l-0.565-0.567c-1.482-1.479-1.656-3.822-0.408-5.504
						c3.164-4.266,4.834-9.323,4.834-14.628c0-5.706-1.896-11.058-5.484-15.478c-1.366-1.68-1.24-4.12,0.291-5.65l0.564-0.565
						c0.844-0.844,1.975-1.304,3.199-1.231c1.192,0.06,2.305,0.621,3.061,1.545c4.977,6.09,7.606,13.484,7.606,21.38
						c0,7.354-2.325,14.354-6.725,20.24C65.131,68.216,64.007,68.832,62.784,68.919z M80.252,81.976
						c-0.764,0.903-1.869,1.445-3.052,1.495c-0.058,0.002-0.117,0.004-0.177,0.004c-1.119,0-2.193-0.442-2.988-1.237l-0.555-0.555
						c-1.551-1.55-1.656-4.029-0.246-5.707c6.814-8.104,10.568-18.396,10.568-28.982c0-11.011-4.019-21.611-11.314-29.847
						c-1.479-1.672-1.404-4.203,0.17-5.783l0.554-0.555c0.822-0.826,1.89-1.281,3.115-1.242c1.163,0.033,2.263,0.547,3.036,1.417
						c8.818,9.928,13.675,22.718,13.675,36.01C93.04,59.783,88.499,72.207,80.252,81.976z"/>
					</g>
					</svg>
				</li></ul>
			</div>
			<div id="transTextContainer">
				<div id="eSelTextTrans" dir="auto"></div>
				<ul>
					<li title="Listen" data-i18n-title="btnListen" id="listenTranslated">
						<svg id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="10px" height="10px" viewBox="0 0 93.038 93.038"
							style="enable-background:new 0 0 93.038 93.038;" xml:space="preserve">
						<g>
							<path d="M46.547,75.521c0,1.639-0.947,3.128-2.429,3.823c-0.573,0.271-1.187,0.402-1.797,0.402c-0.966,0-1.923-0.332-2.696-0.973
							l-23.098-19.14H4.225C1.892,59.635,0,57.742,0,55.409V38.576c0-2.334,1.892-4.226,4.225-4.226h12.303l23.098-19.14
							c1.262-1.046,3.012-1.269,4.493-0.569c1.481,0.695,2.429,2.185,2.429,3.823L46.547,75.521L46.547,75.521z M62.784,68.919
							c-0.103,0.007-0.202,0.011-0.304,0.011c-1.116,0-2.192-0.441-2.987-1.237l-0.565-0.567c-1.482-1.479-1.656-3.822-0.408-5.504
							c3.164-4.266,4.834-9.323,4.834-14.628c0-5.706-1.896-11.058-5.484-15.478c-1.366-1.68-1.24-4.12,0.291-5.65l0.564-0.565
							c0.844-0.844,1.975-1.304,3.199-1.231c1.192,0.06,2.305,0.621,3.061,1.545c4.977,6.09,7.606,13.484,7.606,21.38
							c0,7.354-2.325,14.354-6.725,20.24C65.131,68.216,64.007,68.832,62.784,68.919z M80.252,81.976
							c-0.764,0.903-1.869,1.445-3.052,1.495c-0.058,0.002-0.117,0.004-0.177,0.004c-1.119,0-2.193-0.442-2.988-1.237l-0.555-0.555
							c-1.551-1.55-1.656-4.029-0.246-5.707c6.814-8.104,10.568-18.396,10.568-28.982c0-11.011-4.019-21.611-11.314-29.847
							c-1.479-1.672-1.404-4.203,0.17-5.783l0.554-0.555c0.822-0.826,1.89-1.281,3.115-1.242c1.163,0.033,2.263,0.547,3.036,1.417
							c8.818,9.928,13.675,22.718,13.675,36.01C93.04,59.783,88.499,72.207,80.252,81.976z"/>
						</g>
						</svg>
					</li>
					<li title="Copy" data-i18n-title="btncopy" id="copy">
						<svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M13 7H7V5H13V7Z" fill="currentColor" />
						<path d="M13 11H7V9H13V11Z" fill="currentColor" />
						<path d="M7 15H13V13H7V15Z" fill="currentColor" />
						<path fill-rule="evenodd" clip-rule="evenodd" d="M3 19V1H17V5H21V23H7V19H3ZM15 17V3H5V17H15ZM17 7V19H9V21H19V7H17Z" fill="currentColor"/>
						</svg>
					</li>
					<li title="Replace" data-i18n-title="btnReplace" id="replace" hidden>
						<svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
						d="M5.75739 7.17154L7.1716 5.75732L16.2426 14.8283L16.2426 10.2427H18.2426L18.2426 18.2427H10.2426V16.2427L14.8285 16.2427L5.75739 7.17154Z"
						fill="currentColor"
						/>
						</svg>
					</li>
				</ul>
			</div>
			<div id="drag">
				<ul id="setTargetLanguage">
					<!-- Dynamic language buttons will be inserted here -->
				</ul>
				<div id="moreOrLess"><i class="arrow up" id="more"></i><i class="arrow down" id="less"></i></div>
				<ul>
					<li title="Google" id="sGoogle">g</li>
					<li title="Bing" id="sBing">b</li>
					<li title="Yandex" id="sYandex">y</li>
					<li title="DeepL" id="sDeepL" hidden>d</li>
					<li title="DeepLX" id="sDeepLX" hidden>x</li>
					<li title="Libretranslate" id="sLibre" hidden>l</li>
					<li style="opacity: 0; cursor: move;">O</li>
				</ul>
			</div>
		</div>
        `;

    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute(
      "href",
      chrome.runtime.getURL("/contentScript/css/translateSelected.css")
    );
    isCSSLoaded = false;
    link.onload = (e) => {
      isCSSLoaded = true;
      if (onCSSLoad) onCSSLoad();
    };
    shadowRoot.appendChild(link);

    const styleFix = document.createElement("style");
    styleFix.textContent = `
		#eSelTextTrans,#eOrigText {
			margin-right: 22px;
		}
		`;
    shadowRoot.appendChild(styleFix);

    dragElement(
      shadowRoot.getElementById("eDivResult"),
      shadowRoot.getElementById("drag")
    );

    const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;

    if (CSS.supports("backdrop-filter: blur(5px)") && !isFirefox && false) {
      const el = document.createElement("style");
      el.setAttribute("id", "backdropFilterElement");
      el.setAttribute("rel", "stylesheet");
      el.textContent = `
                    #eDivResult {
                        backdrop-filter: blur(3px);
                        background-color: rgba(0, 0, 0, 0.5);
                    }
                    li {
                    	background-color: rgba(255, 255, 255, 0.1);
                    }
                    .selected {
                    	background-color: rgba(255, 255, 255, 0.3);
                    }
                    #moreOrLess {
                		background-color: rgba(255, 255, 255, 0.1);
            		}
            		hr {
            			border: 1px rgba(255, 255, 255, 0.5) solid;
            		}
            		#listen {
            		    fill: white;
            		}
                `;
      shadowRoot.appendChild(el);
    } else {
      const el = document.createElement("style");
      el.setAttribute("id", "backdropFilterElement");
      el.setAttribute("rel", "stylesheet");
      let darkMode = false;
      switch (twpConfig.get("darkMode")) {
        case "auto":
          if (matchMedia("(prefers-color-scheme: dark)").matches)
            darkMode = true;
          break;
        case "yes":
          darkMode = true;
          break;
      }
      if (darkMode === true) {
        el.textContent = `
                    #eDivResult {
                        backdrop-filter: none;
                        background-color: rgba(25, 25, 25, 0.98);
                        color: white;
                    }
                    li, #moreOrLess {
                    	background-color: rgba(255, 255, 255, 0.2);
                    }
                    .selected {
                    	background-color: rgba(255, 255, 255, 0.4);
                    }
            		hr {
            			border: 1px rgba(225, 225, 225, 0.75) solid;
            		}
            		#listen {
            		    fill: white;
            		}
                `;
      } else {
        el.textContent = `
                    #eDivResult {
                        backdrop-filter: none;
                        background-color: rgba(225, 225, 225, 0.98);
                        color: black;
                    }
                    li, #moreOrLess {
                    	background-color: rgba(0, 0, 0, 0.2);
                    }
                    .selected {
                    	background-color: rgba(0, 0, 0, 0.4);
                    }
            		hr {
            			border: 1px rgba(0, 0, 0, 0.75) solid;
            		}
            		#listen {
            		    fill: black;
            		}
                `;
      }
      shadowRoot.appendChild(el);
    }

    eButtonTransSelText = shadowRoot.getElementById("eButtonTransSelText");
    eDivResult = shadowRoot.getElementById("eDivResult");
    eSelTextTrans = shadowRoot.getElementById("eSelTextTrans");
    eOrigText = shadowRoot.getElementById("eOrigText");
    origTextContainer = shadowRoot.getElementById("origTextContainer");

    const eMoreOrLess = shadowRoot.getElementById("moreOrLess");
    const eMore = shadowRoot.getElementById("more");
    const eLess = shadowRoot.getElementById("less");

    const sGoogle = shadowRoot.getElementById("sGoogle");
    const sYandex = shadowRoot.getElementById("sYandex");
    const sBing = shadowRoot.getElementById("sBing");
    const sDeepL = shadowRoot.getElementById("sDeepL");
    const sDeepLX = shadowRoot.getElementById("sDeepLX");
    const sLibre = shadowRoot.getElementById("sLibre");
    const eCopy = shadowRoot.getElementById("copy");
    const eReplace = shadowRoot.getElementById("replace");
    const eListenOriginal = shadowRoot.getElementById("listenOriginal");
    const eListenTranslated = shadowRoot.getElementById("listenTranslated");

    if (
      gSelectionInfo &&
      (gSelectionInfo.isInputElement || gSelectionInfo.isContentEditable)
    ) {
      eReplace.style.display = "block";
      eSelTextTrans.style.minHeight = "55px";
    } else {
      eReplace.style.display = "none";
      eSelTextTrans.style.minHeight = null;
    }

    function replaceText() {
      const prevSelInfo = prevSelectionInfo;
      destroy();
      if (prevSelInfo.element.nodeType === 3) {
        prevSelInfo.element.parentNode.focus();
      } else {
        prevSelInfo.element.focus();
      }
      document.execCommand("selectAll", false);
      if (prevSelInfo.isInputElement) {
        prevSelInfo.element.setSelectionRange(
          prevSelInfo.selStart,
          prevSelInfo.selEnd
        );
      } else if (prevSelInfo.isContentEditable) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(prevSelInfo.range);
      }
      document.execCommand("insertText", false, eSelTextTrans.textContent);
    }

    eCopy.onclick = () => {
      navigator.clipboard.writeText(eSelTextTrans.textContent).then(() => {
        const oldBackgroundColor = eCopy.style.backgroundColor;
        eCopy.style.backgroundColor = "rgba(0, 255, 0, 0.4)";
        setTimeout(() => {
          eCopy.style.backgroundColor = oldBackgroundColor;
        }, 500);
      });
    };

    eReplace.onclick = replaceText;

    eOrigText.onkeypress = (e) => {
      e.stopPropagation();
    };

    eOrigText.onkeydown = (e) => {
      e.stopPropagation();
    };

    let lastTimePressedCtrl = null;

    eOrigText.onkeyup = (e) => {
      e.stopPropagation();

      if (twpConfig.get("translateSelectedWhenPressTwice") !== "yes") return;
      // https://github.com/FilipePS/Traduzir-paginas-web/issues/577
      if (isSelectingText()) {
        return onKeyUp(e);
      } else {
        if (eReplace.hasAttribute("hidden")) return;
      }

      if (e.key == "Control") {
        if (
          lastTimePressedCtrl &&
          performance.now() - lastTimePressedCtrl < 250
        ) {
          lastTimePressedCtrl = performance.now();
          replaceText();
        }
        lastTimePressedCtrl = performance.now();
      }
    };

    let translateNewInputTimerHandler;
    eOrigText.oninput = () => {
      clearTimeout(translateNewInputTimerHandler);
      translateNewInputTimerHandler = setTimeout(translateNewInput, 600);
    };

    eMoreOrLess.onclick = () => {
      if (twpConfig.get("expandPanelTranslateSelectedText") === "no") {
        twpConfig.set("expandPanelTranslateSelectedText", "yes");
      } else {
        twpConfig.set("expandPanelTranslateSelectedText", "no");
      }

      setCaretAtEnd();
    };

    sGoogle.onclick = () => {
      currentTextTranslatorService = "google";
      twpConfig.set("textTranslatorService", "google");
      translateNewInput();

      sGoogle.classList.remove("selected");
      sYandex.classList.remove("selected");
      sBing.classList.remove("selected");
      sDeepL.classList.remove("selected");
      sDeepLX.classList.remove("selected");
      sLibre.classList.remove("selected");

      sGoogle.classList.add("selected");
    };
    sYandex.onclick = () => {
      currentTextTranslatorService = "yandex";
      twpConfig.set("textTranslatorService", "yandex");
      translateNewInput();

      sGoogle.classList.remove("selected");
      sYandex.classList.remove("selected");
      sBing.classList.remove("selected");
      sDeepL.classList.remove("selected");
      sDeepLX.classList.remove("selected");
      sLibre.classList.remove("selected");

      sYandex.classList.add("selected");
    };
    sBing.onclick = () => {
      currentTextTranslatorService = "bing";
      twpConfig.set("textTranslatorService", "bing");
      translateNewInput();

      sGoogle.classList.remove("selected");
      sYandex.classList.remove("selected");
      sBing.classList.remove("selected");
      sDeepL.classList.remove("selected");
      sDeepLX.classList.remove("selected");
      sLibre.classList.remove("selected");

      sBing.classList.add("selected");
    };
    sDeepL.onclick = () => {
      if (
        twpConfig.get("deepl_confirmed") === "yes" ||
        confirm(twpI18n.getMessage("msgSetDeepLAlert"))
      ) {
        twpConfig.set("deepl_confirmed", "yes");

        currentTextTranslatorService = "deepl";
        twpConfig.set("textTranslatorService", "deepl");
        translateNewInput();

        sGoogle.classList.remove("selected");
        sYandex.classList.remove("selected");
        sBing.classList.remove("selected");
        sDeepL.classList.remove("selected");
        sDeepLX.classList.remove("selected");
        sLibre.classList.remove("selected");

        sDeepL.classList.add("selected");
      }
    };
    sDeepLX.onclick = () => {
      currentTextTranslatorService = "deeplx";
      twpConfig.set("textTranslatorService", "deeplx");
      translateNewInput();

      sGoogle.classList.remove("selected");
      sYandex.classList.remove("selected");
      sBing.classList.remove("selected");
      sDeepL.classList.remove("selected");
      sDeepLX.classList.remove("selected");
      sLibre.classList.remove("selected");

      sDeepLX.classList.add("selected");
    };
    sLibre.onclick = () => {
      currentTextTranslatorService = "libre";
      twpConfig.set("textTranslatorService", "libre");
      translateNewInput();

      sGoogle.classList.remove("selected");
      sYandex.classList.remove("selected");
      sBing.classList.remove("selected");
      sDeepL.classList.remove("selected");
      sDeepLX.classList.remove("selected");
      sLibre.classList.remove("selected");

      sLibre.classList.add("selected");
    };

    const setTargetLanguage = shadowRoot.getElementById("setTargetLanguage");
    setTargetLanguage.onclick = (e) => {
      if (e.target.getAttribute("value")) {
        const langCode = twpLang.fixTLanguageCode(
          e.target.getAttribute("value")
        );
        if (langCode) {
          currentTargetLanguage = langCode;
          twpConfig.setTargetLanguageTextTranslation(langCode);
          translateNewInput();
        }

        shadowRoot.querySelectorAll("#setTargetLanguage li").forEach((li) => {
          li.classList.remove("selected");
        });

        e.target.classList.add("selected");
      }
    };

    function onListenClick(type, element, text, language) {
      const msgListen = twpI18n.getMessage("btnListen");
      const msgStopListening = twpI18n.getMessage("btnStopListening");

      eListenOriginal.classList.remove("selected");
      eListenTranslated.classList.remove("selected");
      eListenOriginal.setAttribute("title", msgStopListening);
      eListenTranslated.setAttribute("title", msgStopListening);

      if (isPlayingAudio) {
        stopAudio();
        element.classList.remove("selected");
      } else {
        playAudio(text, language, () => {
          element.classList.remove("selected");
          element.setAttribute("title", msgListen);
        });
        element.classList.add("selected");
      }
    }

    let lastListenAudioType = null;
    eListenOriginal.onclick = async () => {
      let { lang, isReliable } = await detectTextLanguage(
        eOrigText.textContent
      );
      if (!isReliable && originalTabLanguage !== "und") {
        lang = originalTabLanguage;
      }
      if (lastListenAudioType !== "original") {
        stopAudio();
      }
      lastListenAudioType = "original";
      onListenClick("original", eListenOriginal, eOrigText.textContent, lang);
    };

    eListenTranslated.onclick = () => {
      if (lastListenAudioType !== "translated") {
        stopAudio();
      }
      lastListenAudioType = "translated";
      onListenClick(
        "translated",
        eListenTranslated,
        eSelTextTrans.textContent,
        currentTargetLanguage
      );
    };

    document.body.appendChild(divElement);

    twpI18n.translateDocument(shadowRoot);

    if (platformInfo.isMobile.any) {
      eButtonTransSelText.style.width = "30px";
      eButtonTransSelText.style.height = "30px";
      document.addEventListener("touchstart", onTouchstart);
    }

    eButtonTransSelText.addEventListener("click", onClick);
    document.addEventListener("mousedown", onDown);

    // Dynamically create language buttons based on user preferences
    function updateTargetLanguageButtons() {
      const setTargetLanguageContainer = shadowRoot.getElementById("setTargetLanguage");
      setTargetLanguageContainer.innerHTML = "";

      currentTargetLanguages.forEach((langCode, index) => {
        const li = document.createElement("li");
        li.setAttribute("value", langCode);
        li.setAttribute("title", twpLang.codeToLanguage(langCode));
        li.textContent = langCode;

        if (langCode === currentTargetLanguage) {
          li.classList.add("selected");
        }

        setTargetLanguageContainer.appendChild(li);
      });
    }

    updateTargetLanguageButtons();

    if (currentTextTranslatorService === "yandex") {
      sYandex.classList.add("selected");
    } else if (currentTextTranslatorService == "deepl") {
      sDeepL.classList.add("selected");
    } else if (currentTextTranslatorService == "bing") {
      sBing.classList.add("selected");
    } else if (currentTextTranslatorService == "deeplx") {
      sDeepLX.classList.add("selected");
    } else if (currentTextTranslatorService == "libre") {
      sLibre.classList.add("selected");
    } else {
      sGoogle.classList.add("selected");
    }

    const enabledServices = twpConfig.get("enabledServices");
    if (enabledServices.includes("google")) {
      sGoogle.removeAttribute("hidden");
    } else {
      sGoogle.setAttribute("hidden", "");
    }
    if (enabledServices.includes("bing")) {
      sBing.removeAttribute("hidden");
    } else {
      sBing.setAttribute("hidden", "");
    }
    if (enabledServices.includes("yandex")) {
      sYandex.removeAttribute("hidden");
    } else {
      sYandex.setAttribute("hidden", "");
    }
    if (enabledServices.includes("deepl")) {
      sDeepL.removeAttribute("hidden");
    } else {
      sDeepL.setAttribute("hidden", "");
    }
    if (twpConfig.get("customServices").find((cs) => cs.name === "libre")) {
      sLibre.removeAttribute("hidden");
    } else {
      sLibre.setAttribute("hidden", "");
    }
    if (twpConfig.get("customServices").find((cs) => cs.name === "deeplx")) {
      sDeepLX.removeAttribute("hidden");
    } else {
      sDeepLX.setAttribute("hidden", "");
    }

    if (
      twpConfig.get("expandPanelTranslateSelectedText") === "yes" ||
      (prevSelectionInfo &&
        (prevSelectionInfo.isContentEditable ||
          prevSelectionInfo.isInputElement))
    ) {
      origTextContainer.style.display = "block";
      eMore.style.display = "none";
      eLess.style.display = "block";
      eMoreOrLess.setAttribute("title", twpI18n.getMessage("less"));
    } else {
      origTextContainer.style.display = "none";
      eMore.style.display = "block";
      eLess.style.display = "none";
      eMoreOrLess.setAttribute("title", twpI18n.getMessage("more"));
    }

    twpConfig.onChanged((name, newvalue) => {
      switch (name) {
        case "enabledServices": {
          const enabledServices = newvalue;
          if (enabledServices.includes("google")) {
            sGoogle.removeAttribute("hidden");
          } else {
            sGoogle.setAttribute("hidden", "");
          }
          if (enabledServices.includes("bing")) {
            sBing.removeAttribute("hidden");
          } else {
            sBing.setAttribute("hidden", "");
          }
          if (enabledServices.includes("yandex")) {
            sYandex.removeAttribute("hidden");
          } else {
            sYandex.setAttribute("hidden", "");
          }
          if (enabledServices.includes("deepl")) {
            sDeepL.removeAttribute("hidden");
          } else {
            sDeepL.setAttribute("hidden", "");
          }
          break;
        }
        case "customServices": {
          if (newvalue.find((cs) => cs.name === "libre")) {
            sLibre.removeAttribute("hidden");
          } else {
            sLibre.setAttribute("hidden", "");
          }
          if (newvalue.find((cs) => cs.name === "deeplx")) {
            sDeepLX.removeAttribute("hidden");
          } else {
            sDeepLX.setAttribute("hidden", "");
          }
          break;
        }
        case "expandPanelTranslateSelectedText":
          const prevHeight = parseInt(getComputedStyle(eDivResult).height);
          if (newvalue === "yes") {
            origTextContainer.style.display = "block";
            eMore.style.display = "none";
            eLess.style.display = "block";
            eMoreOrLess.setAttribute("title", twpI18n.getMessage("less"));
            eDivResult.style.top =
              parseInt(eDivResult.style.top) +
              (prevHeight - parseInt(getComputedStyle(eDivResult).height)) +
              "px";
          } else {
            origTextContainer.style.display = "none";
            eMore.style.display = "block";
            eLess.style.display = "none";
            eMoreOrLess.setAttribute("title", twpI18n.getMessage("more"));
            eDivResult.style.top =
              parseInt(eDivResult.style.top) +
              (prevHeight - parseInt(getComputedStyle(eDivResult).height)) +
              "px";
          }
          break;
      }
    });
  }

  function destroy() {
    window.isTranslatingSelected = false;
    fooCount++;
    stopAudio();
    if (!divElement) return;

    eButtonTransSelText.removeEventListener("click", onClick);
    document.removeEventListener("mousedown", onDown);
    if (platformInfo.isMobile.any) {
      document.removeEventListener("touchstart", onTouchstart);
    }
    divElement.remove();
    divElement = eButtonTransSelText = eDivResult = shadowRoot = null;
  }

  function destroyIfButtonIsShowing(e) {
    if (
      eButtonTransSelText &&
      e.target !== divElement &&
      eButtonTransSelText.style.display === "block"
    ) {
      destroy();
    }
  }

  twpConfig.onChanged(function (name, newValue) {
    switch (name) {
      case "textTranslatorService":
        currentTextTranslatorService = newValue;
        break;
      case "targetLanguages":
        currentTargetLanguages = newValue;
        // Update language buttons if the interface is active
        if (shadowRoot && shadowRoot.getElementById("setTargetLanguage") && typeof updateTargetLanguageButtons === 'function') {
          updateTargetLanguageButtons();
        }
        break;
      case "targetLanguageTextTranslation":
        currentTargetLanguage = newValue;
        // Update selected language button if the interface is active
        if (shadowRoot && shadowRoot.getElementById("setTargetLanguage") && typeof updateTargetLanguageButtons === 'function') {
          updateTargetLanguageButtons();
        }
        break;
      case "alwaysTranslateSites":
        awaysTranslateThisSite = newValue.indexOf(tabHostName) !== -1;
        updateEventListener();
        break;
      case "neverTranslateSites":
        translateThisSite = newValue.indexOf(tabHostName) === -1;
        updateEventListener();
        break;
      case "neverTranslateLangs":
        translateThisLanguage = newValue.indexOf(originalTabLanguage) === -1;
        updateEventListener();
        break;
      case "showTranslateSelectedButton":
        showTranslateSelectedButton = newValue;
        updateEventListener();
        break;
      case "dontShowIfIsNotValidText":
        dontShowIfIsNotValidText = newValue;
        break;
      case "dontShowIfPageLangIsTargetLang":
        dontShowIfPageLangIsTargetLang = newValue;
        updateEventListener();
        break;
      case "dontShowIfPageLangIsUnknown":
        dontShowIfPageLangIsUnknown = newValue;
        updateEventListener();
        break;
      case "dontShowIfSelectedTextIsTargetLang":
        dontShowIfSelectedTextIsTargetLang = newValue;
        break;
      case "dontShowIfSelectedTextIsUnknown":
        dontShowIfSelectedTextIsUnknown = newValue;
        break;
    }
  });

  function update_eDivResult(result = "") {
    if (eDivResult.style.display !== "block") {
      init();
    }

    function onloaded() {
      const eTop = prevSelectionInfo.bottom;
      const eLeft = prevSelectionInfo.left;

      if (twpLang.isRtlLanguage(currentTargetLanguage)) {
        eSelTextTrans.setAttribute("dir", "rtl");
      } else {
        eSelTextTrans.setAttribute("dir", "ltr");
      }
      eSelTextTrans.textContent = result;
      let top = parseInt(eDivResult.style.top) || 0,
        left = parseInt(eDivResult.style.left) || 0;
      if (eDivResult.style.display !== "block") {
        eDivResult.style.display = "block";
        eDivResult.style.top = "0px";
        eDivResult.style.left = "0px";
        eOrigText.textContent = prevSelectionInfo.text;

        setCaretAtEnd();

        const height = parseInt(eDivResult.offsetHeight);
        top = eTop + 5;
        top = Math.max(0, top);
        top = Math.min(window.innerHeight - height, top);

        const width = parseInt(eDivResult.offsetWidth);
        left = parseInt(eLeft /*- width / 2*/);
        left = Math.max(0, left);
        left = Math.min(window.innerWidth - width, left);
      }

      eDivResult.style.top =
        Math.min(
          window.innerHeight - parseInt(getComputedStyle(eDivResult).height),
          top
        ) + "px";
      eDivResult.style.left =
        Math.min(
          window.innerWidth - parseInt(getComputedStyle(eDivResult).width),
          left
        ) + "px";
    }

    if (isCSSLoaded) {
      onloaded();
    } else {
      const currentFooCount = fooCount;
      onCSSLoad = () => {
        onCSSLoad = null;
        if (currentFooCount !== fooCount) return;
        onloaded();
      };
    }
  }

  function translateNewInput() {
    fooCount++;
    const currentFooCount = fooCount;
    stopAudio();

    backgroundTranslateSingleText(
      currentTextTranslatorService,
      "auto",
      currentTargetLanguage,
      eOrigText.textContent
    ).then((result) => {
      if (currentFooCount !== fooCount) return;

      update_eDivResult(result);
    });
  }

  function translateSelText(usePrevSelectionInfo = false) {
    if (!usePrevSelectionInfo && gSelectionInfo) {
      prevSelectionInfo = gSelectionInfo;
    } else if (!(usePrevSelectionInfo && prevSelectionInfo)) {
      return;
    }

    eOrigText.textContent = prevSelectionInfo.text;

    translateNewInput();
    const currentFooCount = fooCount;
    setTimeout(() => {
      if (currentFooCount !== fooCount) return;
      update_eDivResult(eSelTextTrans.textContent);
      fooCount = currentFooCount;
    }, 1000);
  }

  function onClick(e) {
    translateSelText();
    eButtonTransSelText.style.display = "none";
  }

  function onDown(e) {
    if (e.target != divElement) {
      eDivResult.style.display = "none";
      eButtonTransSelText.style.display = "none";
      destroy();
    }
  }

  let isTouchSelection = false;

  function onTouchstart(e) {
    isTouchSelection = true;
    onDown(e);
  }

  function getSelectionText() {
    let text = "";
    const activeEl = document.activeElement;
    const activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
    if (
      activeElTagName == "textarea" ||
      (activeElTagName == "input" &&
        /^(?:text|search)$/i.test(activeEl.type) &&
        typeof activeEl.selectionStart == "number")
    ) {
      text = activeEl.value.slice(
        activeEl.selectionStart,
        activeEl.selectionEnd
      );
    } else if (window.getSelection) {
      text = window.getSelection().toString();
    }
    return text;
  }

  function readSelection(dontReadIfSelectionDontChange = false) {
    let newSelectionInfo = null;

    const activeEl = document.activeElement;
    const activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
    if (
      activeElTagName == "textarea" ||
      (activeElTagName == "input" &&
        /^(?:text|search)$/i.test(activeEl.type) &&
        typeof activeEl.selectionStart == "number")
    ) {
      const text = activeEl.value.slice(
        activeEl.selectionStart,
        activeEl.selectionEnd
      );
      const rect = activeEl.getBoundingClientRect();
      newSelectionInfo = {
        isInputElement: true,
        isContentEditable: false,
        element: activeEl,
        selStart: activeEl.selectionStart,
        selEnd: activeEl.selectionEnd,
        text: text,
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
      };
    } else if (window.getSelection) {
      const selection = window.getSelection();
      if (selection.type == "Range") {
        const text = selection.toString();
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        newSelectionInfo = {
          isInputElement: false,
          isContentEditable:
            selection.focusNode.nodeType === 3
              ? selection.focusNode.parentNode.isContentEditable
              : selection.focusNode.isContentEditable,
          element: selection.focusNode,
          selStart: selection.getRangeAt(0).startOffset,
          selEnd: selection.getRangeAt(0).endOffset,
          text: text,
          top: rect.top,
          left: rect.left,
          bottom: rect.bottom,
          right: rect.right,
          range: selection.getRangeAt(0),
        };
      }
    }

    if (
      dontReadIfSelectionDontChange &&
      gSelectionInfo &&
      newSelectionInfo &&
      gSelectionInfo.text === newSelectionInfo.text
    ) {
      gSelectionInfo = newSelectionInfo;
      return false;
    }
    gSelectionInfo = newSelectionInfo;
    return true;
  }

  function isValidText(text) {
    if (text.length < 2) return false;
    if (/^[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?\s]*$/.test(text)) return false;
    return true;
  }

  async function onUp(e) {
    if (e.target == divElement) return;

    const clientX = Math.max(
      typeof e.clientX === "undefined" ? 0 : e.clientX,
      typeof e.changedTouches === "undefined" ? 0 : e.changedTouches[0].clientX
    );
    const clientY = Math.max(
      typeof e.clientY === "undefined" ? 0 : e.clientY,
      typeof e.changedTouches === "undefined" ? 0 : e.changedTouches[0].clientY
    );

    const selectedText = getSelectionText().trim();
    if (!selectedText || selectedText.length < 1) return;
    let detectedLanguage = (await detectTextLanguage(selectedText)).lang;
    if (!detectedLanguage) detectedLanguage = "und";

    if (
      ((dontShowIfSelectedTextIsTargetLang == "yes" &&
        detectedLanguage !== currentTargetLanguage) ||
        dontShowIfSelectedTextIsTargetLang != "yes") &&
      ((dontShowIfSelectedTextIsUnknown == "yes" &&
        detectedLanguage !== "und") ||
        dontShowIfSelectedTextIsUnknown != "yes") &&
      (dontShowIfIsNotValidText != "yes" || isValidText(selectedText))
    ) {
      init();
      if (platformInfo.isMobile.any) {
        eButtonTransSelText.style.left = window.innerWidth - 45 + "px";
        eButtonTransSelText.style.top = clientY + "px";
      } else {
        eButtonTransSelText.style.left =
          Math.min(window.innerWidth - 40, clientX + 25) + "px";
        eButtonTransSelText.style.top = Math.max(2, clientY - 35) + "px";
      }

      eButtonTransSelText.style.display = "block";
    }
  }

  let showButtonTimerHandler = null;

  function onMouseup(e) {
    if (e.button != 0) return;
    if (e.target == divElement) return;
    if (readSelection(true)) {
      clearTimeout(showButtonTimerHandler);
      showButtonTimerHandler = setTimeout(() => onUp(e), 150);
    }
  }

  function onTouchend(e) {
    if (e.target == divElement) return;
    readSelection();
    clearTimeout(showButtonTimerHandler);
    showButtonTimerHandler = setTimeout(() => onUp(e), 150);
  }

  function onSelectionchange(e) {
    if (isTouchSelection) {
      readSelection();
    }
  }

  function isSelectingText() {
    const activeEl = document.activeElement;
    const activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
    if (
      activeElTagName == "textarea" ||
      (activeElTagName == "input" &&
        /^(?:text|search)$/i.test(activeEl.type) &&
        typeof activeEl.selectionStart == "number")
    ) {
      const text = activeEl.value.slice(
        activeEl.selectionStart,
        activeEl.selectionEnd
      );
      if (text) return true;
    } else if (window.getSelection) {
      const selection = window.getSelection();
      if (selection.type == "Range") {
        const text = selection.toString();
        if (text) return true;
      }
    }
    return false;
  }

  let lastTimePressedCtrl = null;

  function onKeyUp(e) {
    if (e.key === "Escape") {
      destroy();
      return;
    }

    if (twpConfig.get("translateSelectedWhenPressTwice") !== "yes") return;
    if (e.key == "Control") {
      if (
        lastTimePressedCtrl &&
        performance.now() - lastTimePressedCtrl < 280 &&
        isSelectingText()
      ) {
        lastTimePressedCtrl = performance.now();
        readSelection();
        init();
        translateSelText();
      }
      lastTimePressedCtrl = performance.now();
    }
  }

  document.addEventListener("keyup", onKeyUp, true);

  let windowIsInFocus = true;
  window.addEventListener("focus", function (e) {
    windowIsInFocus = true;
    chrome.runtime.sendMessage(
      { action: "thisFrameIsInFocus" },
      checkedLastError
    );
  });
  window.addEventListener("blur", function (e) {
    windowIsInFocus = false;
  });

  window.addEventListener("beforeunload", function (e) {
    destroy();
  });

  function updateEventListener() {
    if (
      showTranslateSelectedButton == "yes" &&
      (awaysTranslateThisSite ||
        (translateThisSite && translateThisLanguage)) &&
      ((dontShowIfPageLangIsTargetLang == "yes" &&
        originalTabLanguage !== currentTargetLanguage) ||
        dontShowIfPageLangIsTargetLang != "yes") &&
      ((dontShowIfPageLangIsUnknown == "yes" &&
        originalTabLanguage !== "und") ||
        dontShowIfPageLangIsUnknown != "yes")
    ) {
      document.addEventListener("mouseup", onMouseup);

      document.addEventListener("blur", destroyIfButtonIsShowing);
      document.addEventListener("visibilitychange", destroyIfButtonIsShowing);

      document.addEventListener("keydown", destroyIfButtonIsShowing);
      document.addEventListener("mousedown", destroyIfButtonIsShowing);
      document.addEventListener("wheel", destroyIfButtonIsShowing);

      if (platformInfo.isMobile.any) {
        document.addEventListener("touchend", onTouchend);
        document.addEventListener("selectionchange", onSelectionchange);
      }
    } else {
      document.removeEventListener("mouseup", onMouseup);

      document.removeEventListener("blur", destroyIfButtonIsShowing);
      document.removeEventListener(
        "visibilitychange",
        destroyIfButtonIsShowing
      );

      document.removeEventListener("keydown", destroyIfButtonIsShowing);
      document.removeEventListener("mousedown", destroyIfButtonIsShowing);
      document.removeEventListener("wheel", destroyIfButtonIsShowing);

      if (platformInfo.isMobile.any) {
        document.removeEventListener("touchend", onTouchend);
        document.removeEventListener("selectionchange", onSelectionchange);
      }
    }
  }

  updateEventListener();

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "TranslateSelectedText") {
      readSelection();
      init();
      translateSelText();
    } else if (request.action === "anotherFrameIsInFocus") {
      if (!windowIsInFocus) {
        destroy();
      }
    } else if (request.action === "hotTranslateSelectedText") {
      readSelection();
      const prevSelInfo = gSelectionInfo;
      if (
        !prevSelInfo?.element?.focus &&
        !prevSelInfo?.element?.parentNode?.focus
      )
        return;
      if (prevSelInfo.isInputElement && prevSelInfo.readOnly) return;
      if (prevSelInfo.text) {
        backgroundTranslateSingleText(
          currentTextTranslatorService,
          "auto",
          currentTargetLanguage,
          prevSelInfo.text
        ).then((result) => {
          if (!result) return;
          destroy();
          if (prevSelInfo.element.nodeType === 3) {
            prevSelInfo.element.parentNode.focus();
          } else {
            prevSelInfo.element.focus();
          }
          document.execCommand("selectAll", false);
          if (prevSelInfo.isInputElement) {
            prevSelInfo.element.setSelectionRange(
              prevSelInfo.selStart,
              prevSelInfo.selEnd
            );
          } else if (prevSelInfo.isContentEditable) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(prevSelInfo.range);
          }
          document.execCommand("insertText", false, result);
        });
      }
    }
  });
});
