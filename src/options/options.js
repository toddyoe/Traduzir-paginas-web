"use strict";

setTimeout(() => {
  fetch("./release-notes/en.html")
    .then((response) => response.text())
    .then((responseText) => {
      window.scrollTo(0, 0);
      document.getElementById("release_notes").innerHTML = responseText;
      document.getElementById("_msgHasBeenUpdated").textContent =
        twpI18n.getMessage("msgHasBeenUpdated");
      document.getElementById("_msgHasBeenUpdated").innerHTML = document
        .getElementById("_msgHasBeenUpdated")
        .textContent.replace(
          "#EXTENSION_NAME#",
          "<b>" + chrome.runtime.getManifest().name + "</b>"
        )
        .replace(
          "#EXTENSION_VERSION#",
          "<b>" + chrome.runtime.getManifest().version + "</b>"
        );
      document.getElementById("_donationText").textContent =
        twpI18n.getMessage("donationText");
      document.getElementById("_donatewithpaypal").textContent =
        twpI18n.getMessage("donatewithpaypal");

      document.getElementById("_donationRecipient").textContent =
        twpI18n.getMessage("msgDonationRecipient");
      document.getElementById("_donationRecipient").innerHTML = document
        .getElementById("_donationRecipient")
        .textContent.replace(
          "#EXTENSION_NAME#",
          "<b>" + chrome.runtime.getManifest().name + "</b>"
        );

      // donation options
      if (navigator.language === "pt-BR") {
        $("#_currency").value = "BRL";
        $("#_donateInUSD").style.display = "none";
      } else {
        $("#_currency").value = "USD";
        $("#_donateInBRL").style.display = "none";
      }

      $("#_currency").onchange = (e) => {
        if (e.target.value === "BRL") {
          $("#_donateInUSD").style.display = "none";
          $("#_donateInBRL").style.display = "block";
        } else {
          $("#_donateInUSD").style.display = "block";
          $("#_donateInBRL").style.display = "none";
        }
      };

      const donationOverflow = document.getElementById("donationOverflow");
      setTimeout(() => {
        donationOverflow.style.display = "none";
      }, 1000);
      donationOverflow.style.display = "block";
    });
}, 800);

var $ = document.querySelector.bind(document);

twpConfig
  .onReady()
  .then(() => {
    // https://github.com/FilipePS/Traduzir-paginas-web/issues/774
    if (sessionStorage !== null) {
      return twpI18n.updateUiMessages(
        sessionStorage.getItem("temporaryUiLanguage")
      );
    } else {
      return twpI18n.updateUiMessages();
    }
  })
  .then(() => {
    twpI18n.translateDocument();
    document.querySelector("[data-i18n='msgDefaultLanguage']").textContent =
      twpI18n.getMessage("msgDefaultLanguage") + " - Default language";

    let temporaryUiLanguage = null;
    if (sessionStorage !== null) {
      temporaryUiLanguage = sessionStorage.getItem("temporaryUiLanguage");
      sessionStorage.removeItem("temporaryUiLanguage");
    }

    if (platformInfo.isMobile.any) {
      let style = document.createElement("style");
      style.textContent = ".desktopOnly {display: none !important}";
      document.head.appendChild(style);
    }

    if (!chrome.pageAction) {
      let style = document.createElement("style");
      style.textContent = ".firefox-only {display: none !important}";
      document.head.appendChild(style);
    }

    let sideBarIsVisible = false;
    $("#btnOpenMenu").onclick = (e) => {
      $("#menuContainer").classList.toggle("change");

      if (sideBarIsVisible) {
        $("#sideBar").style.display = "none";
        sideBarIsVisible = false;
      } else {
        $("#sideBar").style.display = "block";
        sideBarIsVisible = true;
      }
    };

    function hashchange() {
      const hash = location.hash || "#languages";
      const divs = [
        $("#languages"),
        $("#sites"),
        $("#translations"),
        $("#style"),
        $("#hotkeys"),
        $("#privacy"),
        $("#storage"),
        $("#others"),
        $("#experimental"),
        $("#donation"),
        $("#release_notes"),
      ];
      divs.forEach((element) => {
        element.style.display = "none";
      });

      document.querySelectorAll("nav a").forEach((a) => {
        a.classList.remove("w3-light-grey");
      });

      $(hash).style.display = "block";
      $('a[href="' + hash + '"]').classList.add("w3-light-grey");

      let text;
      if (hash === "#donation") {
        text = twpI18n.getMessage("lblMakeDonation");
      } else if (hash === "#release_notes") {
        text = twpI18n.getMessage("lblReleaseNotes");
      } else {
        text = twpI18n.getMessage("lblSettings");
      }
      $("#itemSelectedName").textContent = text;

      if (sideBarIsVisible) {
        $("#menuContainer").classList.toggle("change");
        $("#sideBar").style.display = "none";
        sideBarIsVisible = false;
      }

      if (hash === "#release_notes") {
        $("#btnPatreon").style.display = "none";
      } else {
        $("#btnPatreon").style.display = "block";
      }

      if (hash === "#translations") {
        $("#translations").insertBefore(
          $("#selectServiceContainer"),
          $("#translations").firstChild
        );
      } else if (hash === "#privacy") {
        $("#privacy").insertBefore(
          $("#selectServiceContainer"),
          $("#privacy").firstChild
        );
      }
    }
    hashchange();
    window.addEventListener("hashchange", hashchange);

    function fillLanguageList(select) {
      let langs = twpLang.getLanguageList();

      const langsSorted = [];

      for (const i in langs) {
        langsSorted.push([i, langs[i]]);
      }

      langsSorted.sort(function (a, b) {
        return a[1].localeCompare(b[1]);
      });

      langsSorted.forEach((value) => {
        const option = document.createElement("option");
        option.value = value[0];
        option.textContent = value[1];
        select.appendChild(option);
      });
    }

    fillLanguageList($("#selectTargetLanguage"));
    fillLanguageList($("#selectTargetLanguageForText"));

    fillLanguageList($("#addToNeverTranslateLangs"));
    fillLanguageList($("#addToAlwaysTranslateLangs"));
    fillLanguageList($("#addLangToTranslateWhenHovering"));

    function updateDarkMode() {
      switch (twpConfig.get("darkMode")) {
        case "auto":
          if (matchMedia("(prefers-color-scheme: dark)").matches) {
            enableDarkMode();
          } else {
            disableDarkMode();
          }
          break;
        case "yes":
          enableDarkMode();
          break;
        case "no":
          disableDarkMode();
          break;
        default:
          break;
      }
    }
    updateDarkMode();

    // target languages
    $("#selectUiLanguage").value =
      temporaryUiLanguage || twpConfig.get("uiLanguage");
    $("#selectUiLanguage").onchange = (e) => {
      if (e.target.value === "default") {
        twpConfig.set("uiLanguage", "default");
      } else {
        if (sessionStorage !== null) {
          sessionStorage.setItem("temporaryUiLanguage", e.target.value);
        } else {
          return;
        }
      }
      location.reload();
    };
    $("#btnApplyUiLanguage").onclick = () => {
      if (temporaryUiLanguage) {
        twpConfig.set(
          "uiLanguage",
          temporaryUiLanguage === "default"
            ? "default"
            : twpLang.fixUILanguageCode(temporaryUiLanguage)
        );
        // timeout prevents: TypeError: NetworkError when attempting to fetch resource.
        setTimeout(() => location.reload(), 100);
      } else if (sessionStorage === null) {
        const lang = $("#selectUiLanguage").value;
        twpConfig.set(
          "uiLanguage",
          lang === "default" ? "default" : twpLang.fixUILanguageCode(lang)
        );
        // timeout prevents: TypeError: NetworkError when attempting to fetch resource.
        setTimeout(() => location.reload(), 100);
      }
    };

    const targetLanguage = twpConfig.get("targetLanguage");
    $("#selectTargetLanguage").value = targetLanguage;
    $("#selectTargetLanguage").onchange = (e) => {
      twpConfig.setTargetLanguage(e.target.value, false, true); // skip adding to targetLanguages
      location.reload();
    };

    const targetLanguageTextTranslation = twpConfig.get(
      "targetLanguageTextTranslation"
    );
    $("#selectTargetLanguageForText").value = targetLanguageTextTranslation;
    $("#selectTargetLanguageForText").onchange = (e) => {
      twpConfig.setTargetLanguage(e.target.value, true, true); // skip adding to targetLanguages
      twpConfig.setTargetLanguage(targetLanguage, false, true); // skip adding to targetLanguages
      location.reload();
    };

    // Dynamic favorite languages management
    function buildFavoriteLanguagesList() {
      const targetLanguages = twpConfig.get("targetLanguages");
      const favoriteLanguagesList = $("#favoriteLanguagesList");
      favoriteLanguagesList.innerHTML = "";

      targetLanguages.forEach((langCode, index) => {
        const li = document.createElement("li");
        li.className = "w3-row";

        const labelP = document.createElement("p");
        labelP.className = "w3-half";
        labelP.textContent = twpI18n.getMessage("lblFavoriteLanguage", (index + 1).toString());

        const selectContainer = document.createElement("div");
        selectContainer.className = "w3-half";
        selectContainer.style.display = "flex";
        selectContainer.style.alignItems = "center";

        const select = document.createElement("select");
        select.className = "w3-select w3-border w3-round";
        select.style.flex = "1";
        select.style.marginRight = "10px";
        fillLanguageList(select);
        select.value = langCode;

        select.onchange = (e) => {
          const newTargetLanguages = twpConfig.get("targetLanguages");
          newTargetLanguages[index] = e.target.value;
          twpConfig.set("targetLanguages", newTargetLanguages);

          // Update current target languages if needed
          if (newTargetLanguages.indexOf(twpConfig.get("targetLanguage")) == -1) {
            twpConfig.set("targetLanguage", newTargetLanguages[0]);
          }
          if (newTargetLanguages.indexOf(twpConfig.get("targetLanguageTextTranslation")) == -1) {
            twpConfig.set("targetLanguageTextTranslation", newTargetLanguages[0]);
          }
          location.reload();
        };

        const removeBtn = document.createElement("button");
        removeBtn.className = "w3-button w3-red w3-round";
        removeBtn.textContent = "×";
        removeBtn.title = twpI18n.getMessage("btnRemoveLanguage");
        removeBtn.style.minWidth = "35px";

        // Disable remove button if only one language
        if (targetLanguages.length <= 1) {
          removeBtn.disabled = true;
          removeBtn.style.opacity = "0.5";
        }

        removeBtn.onclick = () => {
          if (twpConfig.removeTargetLanguage(langCode)) {
            buildFavoriteLanguagesList();
          }
        };

        selectContainer.appendChild(select);
        selectContainer.appendChild(removeBtn);
        li.appendChild(labelP);
        li.appendChild(selectContainer);
        favoriteLanguagesList.appendChild(li);
      });

      // Update the add button in the header
      updateAddButton();
    }

    function updateAddButton() {
      const targetLanguages = twpConfig.get("targetLanguages");
      const addBtnContainer = $("#favoriteLanguagesAddBtn");

      // Clear existing button to avoid stale closures
      addBtnContainer.innerHTML = "";

      if (targetLanguages.length < 3) {
        // Create new add button with consistent styling
        const addBtn = document.createElement("button");
        addBtn.className = "w3-button w3-blue w3-round w3-margin-right add";
        addBtn.textContent = twpI18n.getMessage("btnAddLanguage");

        addBtn.onclick = () => {
          // Get fresh targetLanguages data
          const currentTargetLanguages = twpConfig.get("targetLanguages");
          const availableLanguages = twpLang.TargetLanguages;
          let newLang = null;

          for (const lang of availableLanguages) {
            if (currentTargetLanguages.indexOf(lang) === -1) {
              newLang = lang;
              break;
            }
          }

          if (newLang && twpConfig.addNewTargetLanguage(newLang)) {
            buildFavoriteLanguagesList();
          }
        };

        addBtnContainer.appendChild(addBtn);
        addBtnContainer.style.display = "block";
      } else {
        // Hide add button
        addBtnContainer.style.display = "none";
      }
    }

    // Initialize the dynamic favorite languages list
    buildFavoriteLanguagesList();

    // Never translate these languages

    function createNodeToNeverTranslateLangsList(langCode, langName) {
      const li = document.createElement("li");
      li.setAttribute("class", "w3-display-container");
      li.value = langCode;
      li.textContent = langName;

      const close = document.createElement("span");
      close.setAttribute("class", "w3-button w3-transparent w3-display-right");
      close.innerHTML = "&times;";

      close.onclick = (e) => {
        e.preventDefault();

        twpConfig.removeLangFromNeverTranslate(langCode);
        li.remove();
      };

      li.appendChild(close);

      return li;
    }

    const neverTranslateLangs = twpConfig.get("neverTranslateLangs");
    neverTranslateLangs.sort((a, b) => a.localeCompare(b));
    neverTranslateLangs.forEach((langCode) => {
      const langName = twpLang.codeToLanguage(langCode);
      const li = createNodeToNeverTranslateLangsList(langCode, langName);
      $("#neverTranslateLangs").appendChild(li);
    });

    $("#addToNeverTranslateLangs").onchange = (e) => {
      const langCode = e.target.value;
      const langName = twpLang.codeToLanguage(langCode);
      const li = createNodeToNeverTranslateLangsList(langCode, langName);
      $("#neverTranslateLangs").appendChild(li);

      twpConfig.addLangToNeverTranslate(langCode);
    };

    // Always translate these languages

    function createNodeToAlwaysTranslateLangsList(langCode, langName) {
      const li = document.createElement("li");
      li.setAttribute("class", "w3-display-container");
      li.value = langCode;
      li.textContent = langName;

      const close = document.createElement("span");
      close.setAttribute("class", "w3-button w3-transparent w3-display-right");
      close.innerHTML = "&times;";

      close.onclick = (e) => {
        e.preventDefault();

        twpConfig.removeLangFromAlwaysTranslate(langCode);
        li.remove();
      };

      li.appendChild(close);

      return li;
    }

    const alwaysTranslateLangs = twpConfig.get("alwaysTranslateLangs");
    alwaysTranslateLangs.sort((a, b) => a.localeCompare(b));
    alwaysTranslateLangs.forEach((langCode) => {
      const langName = twpLang.codeToLanguage(langCode);
      const li = createNodeToAlwaysTranslateLangsList(langCode, langName);
      $("#alwaysTranslateLangs").appendChild(li);
    });

    $("#addToAlwaysTranslateLangs").onchange = (e) => {
      const langCode = e.target.value;
      const langName = twpLang.codeToLanguage(langCode);
      const li = createNodeToAlwaysTranslateLangsList(langCode, langName);
      $("#alwaysTranslateLangs").appendChild(li);

      twpConfig.addLangToAlwaysTranslate(langCode);
    };

    // langsToTranslateWhenHovering

    function createNodeToLangsToTranslateWhenHoveringList(langCode, langName) {
      const li = document.createElement("li");
      li.setAttribute("class", "w3-display-container");
      li.value = langCode;
      li.textContent = langName;

      const close = document.createElement("span");
      close.setAttribute("class", "w3-button w3-transparent w3-display-right");
      close.innerHTML = "&times;";

      close.onclick = (e) => {
        e.preventDefault();

        twpConfig.removeLangFromTranslateWhenHovering(langCode);
        li.remove();
      };

      li.appendChild(close);

      return li;
    }

    const langsToTranslateWhenHovering = twpConfig.get(
      "langsToTranslateWhenHovering"
    );
    langsToTranslateWhenHovering.sort((a, b) => a.localeCompare(b));
    langsToTranslateWhenHovering.forEach((langCode) => {
      const langName = twpLang.codeToLanguage(langCode);
      const li = createNodeToLangsToTranslateWhenHoveringList(
        langCode,
        langName
      );
      $("#langsToTranslateWhenHovering").appendChild(li);
    });

    $("#addLangToTranslateWhenHovering").onchange = (e) => {
      const langCode = e.target.value;
      const langName = twpLang.codeToLanguage(langCode);
      const li = createNodeToLangsToTranslateWhenHoveringList(
        langCode,
        langName
      );
      $("#langsToTranslateWhenHovering").appendChild(li);

      twpConfig.addLangToTranslateWhenHovering(langCode);
    };

    // Always translate these Sites

    function createNodeToAlwaysTranslateSitesList(hostname) {
      const li = document.createElement("li");
      li.setAttribute("class", "w3-display-container");
      li.value = hostname;
      li.textContent = hostname;

      const close = document.createElement("span");
      close.setAttribute("class", "w3-button w3-transparent w3-display-right");
      close.innerHTML = "&times;";

      close.onclick = (e) => {
        e.preventDefault();

        twpConfig.removeSiteFromAlwaysTranslate(hostname);
        li.remove();
      };

      li.appendChild(close);

      return li;
    }

    const alwaysTranslateSites = twpConfig.get("alwaysTranslateSites");
    alwaysTranslateSites.sort((a, b) => a.localeCompare(b));
    alwaysTranslateSites.forEach((hostname) => {
      const li = createNodeToAlwaysTranslateSitesList(hostname);
      $("#alwaysTranslateSites").appendChild(li);
    });

    $("#addToAlwaysTranslateSites").onclick = (e) => {
      const hostname = prompt("Enter the site hostname", "www.site.com");
      if (!hostname) return;

      const li = createNodeToAlwaysTranslateSitesList(hostname);
      $("#alwaysTranslateSites").appendChild(li);

      twpConfig.addSiteToAlwaysTranslate(hostname);
    };

    // Never translate these Sites

    function createNodeToNeverTranslateSitesList(hostname) {
      const li = document.createElement("li");
      li.setAttribute("class", "w3-display-container");
      li.value = hostname;
      li.textContent = hostname;

      const close = document.createElement("span");
      close.setAttribute("class", "w3-button w3-transparent w3-display-right");
      close.innerHTML = "&times;";

      close.onclick = (e) => {
        e.preventDefault();

        twpConfig.removeSiteFromNeverTranslate(hostname);
        li.remove();
      };

      li.appendChild(close);

      return li;
    }

    const neverTranslateSites = twpConfig.get("neverTranslateSites");
    neverTranslateSites.sort((a, b) => a.localeCompare(b));
    neverTranslateSites.forEach((hostname) => {
      const li = createNodeToNeverTranslateSitesList(hostname);
      $("#neverTranslateSites").appendChild(li);
    });

    $("#addToNeverTranslateSites").onclick = (e) => {
      const hostname = prompt("Enter the site hostname", "www.site.com");
      if (!hostname) return;

      const li = createNodeToNeverTranslateSitesList(hostname);
      $("#neverTranslateSites").appendChild(li);

      twpConfig.addSiteToNeverTranslate(hostname);
    };

    function createcustomDictionary(keyWord, customValue) {
      const li = document.createElement("li");
      li.setAttribute("class", "w3-display-container");
      li.value = keyWord;
      if (customValue !== "") {
        li.textContent = keyWord + " ------------------- " + customValue;
      } else {
        li.textContent = keyWord;
      }
      const close = document.createElement("span");
      close.setAttribute("class", "w3-button w3-transparent w3-display-right");
      close.innerHTML = "&times;";

      close.onclick = (e) => {
        e.preventDefault();
        twpConfig.removeKeyWordFromcustomDictionary(keyWord);
        li.remove();
      };
      li.appendChild(close);
      return li;
    }

    let customDictionary = twpConfig.get("customDictionary");
    customDictionary = new Map(
      [...customDictionary.entries()].sort((a, b) =>
        String(a[0]).localeCompare(String(b[0]))
      )
    );
    customDictionary.forEach(function (customValue, keyWord) {
      const li = createcustomDictionary(keyWord, customValue);
      $("#customDictionary").appendChild(li);
    });

    $("#addToCustomDictionary").onclick = (e) => {
      let keyWord = prompt("Enter the keyWord, Minimum two letters ", "");
      if (!keyWord || keyWord.length < 2) return;
      keyWord = keyWord.trim().toLowerCase();
      let customValue = prompt(
        "(Optional)\nYou can enter a value to replace it , or fill in nothing.",
        ""
      );
      if (!customValue) customValue = "";
      customValue = customValue.trim();
      const li = createcustomDictionary(keyWord, customValue);
      $("#customDictionary").appendChild(li);
      twpConfig.addKeyWordTocustomDictionary(keyWord, customValue);
    };

    // sitesToTranslateWhenHovering

    function createNodeToSitesToTranslateWhenHoveringList(hostname) {
      const li = document.createElement("li");
      li.setAttribute("class", "w3-display-container");
      li.value = hostname;
      li.textContent = hostname;

      const close = document.createElement("span");
      close.setAttribute("class", "w3-button w3-transparent w3-display-right");
      close.innerHTML = "&times;";

      close.onclick = (e) => {
        e.preventDefault();

        twpConfig.removeSiteFromTranslateWhenHovering(hostname);
        li.remove();
      };

      li.appendChild(close);

      return li;
    }

    const sitesToTranslateWhenHovering = twpConfig.get(
      "sitesToTranslateWhenHovering"
    );
    sitesToTranslateWhenHovering.sort((a, b) => a.localeCompare(b));
    sitesToTranslateWhenHovering.forEach((hostname) => {
      const li = createNodeToSitesToTranslateWhenHoveringList(hostname);
      $("#sitesToTranslateWhenHovering").appendChild(li);
    });

    $("#addSiteToTranslateWhenHovering").onclick = (e) => {
      const hostname = prompt("Enter the site hostname", "www.site.com");
      if (!hostname) return;

      const li = createNodeToSitesToTranslateWhenHoveringList(hostname);
      $("#sitesToTranslateWhenHovering").appendChild(li);

      twpConfig.addSiteToTranslateWhenHovering(hostname);
    };

    // translations options
    $("#pageTranslatorService").onchange = (e) => {
      twpConfig.set("pageTranslatorService", e.target.value);
    };
    $("#pageTranslatorService").value = twpConfig.get("pageTranslatorService");

    $("#textTranslatorService").onchange = (e) => {
      twpConfig.set("textTranslatorService", e.target.value);
    };
    $("#textTranslatorService").value = twpConfig.get("textTranslatorService");

    $("#textToSpeechService").onchange = (e) => {
      twpConfig.set("textToSpeechService", e.target.value);
    };
    $("#textToSpeechService").value = twpConfig.get("textToSpeechService");

    $("#ttsSpeed").oninput = (e) => {
      twpConfig.set("ttsSpeed", e.target.value);
      $("#displayTtsSpeed").textContent = e.target.value;
    };
    $("#ttsSpeed").value = twpConfig.get("ttsSpeed");
    $("#displayTtsSpeed").textContent = twpConfig.get("ttsSpeed");

    $("#ttsVolume").oninput = (e) => {
      twpConfig.set("ttsVolume", e.target.value);
      $("#displayTtsVolume").textContent = e.target.value;
    };
    $("#ttsVolume").value = twpConfig.get("ttsVolume");
    $("#displayTtsVolume").textContent = twpConfig.get("ttsVolume");

    $("#showOriginalTextWhenHovering").onchange = (e) => {
      twpConfig.set("showOriginalTextWhenHovering", e.target.value);
    };
    $("#showOriginalTextWhenHovering").value = twpConfig.get(
      "showOriginalTextWhenHovering"
    );

    $("#translateTag_pre").onchange = (e) => {
      twpConfig.set("translateTag_pre", e.target.value);
    };
    $("#translateTag_pre").value = twpConfig.get("translateTag_pre");

    $("#enableIframePageTranslation").onchange = (e) => {
      twpConfig.set("enableIframePageTranslation", e.target.value);
    };
    $("#enableIframePageTranslation").value = twpConfig.get(
      "enableIframePageTranslation"
    );

    $("#dontSortResults").onchange = (e) => {
      twpConfig.set("dontSortResults", e.target.value);
    };
    $("#dontSortResults").value = twpConfig.get("dontSortResults");

    $("#translateDynamicallyCreatedContent").onchange = (e) => {
      twpConfig.set("translateDynamicallyCreatedContent", e.target.value);
    };
    $("#translateDynamicallyCreatedContent").value = twpConfig.get(
      "translateDynamicallyCreatedContent"
    );

    $("#autoTranslateWhenClickingALink").onchange = (e) => {
      if (e.target.value == "yes") {
        chrome.permissions.request(
          {
            permissions: ["webNavigation"],
          },
          (granted) => {
            if (granted) {
              twpConfig.set("autoTranslateWhenClickingALink", "yes");
            } else {
              twpConfig.set("autoTranslateWhenClickingALink", "no");
              e.target.value = "no";
            }
          }
        );
      } else {
        twpConfig.set("autoTranslateWhenClickingALink", "no");
        chrome.permissions.remove({
          permissions: ["webNavigation"],
        });
      }
    };
    $("#autoTranslateWhenClickingALink").value = twpConfig.get(
      "autoTranslateWhenClickingALink"
    );

    function enableOrDisableTranslateSelectedAdvancedOptions(value) {
      if (value === "no") {
        document
          .querySelectorAll("#translateSelectedAdvancedOptions input")
          .forEach((input) => {
            input.setAttribute("disabled", "");
          });
      } else {
        document
          .querySelectorAll("#translateSelectedAdvancedOptions input")
          .forEach((input) => {
            input.removeAttribute("disabled");
          });
      }
    }

    $("#showTranslateSelectedButton").onchange = (e) => {
      twpConfig.set("showTranslateSelectedButton", e.target.value);
      enableOrDisableTranslateSelectedAdvancedOptions(e.target.value);
    };
    $("#showTranslateSelectedButton").value = twpConfig.get(
      "showTranslateSelectedButton"
    );
    enableOrDisableTranslateSelectedAdvancedOptions(
      twpConfig.get("showTranslateSelectedButton")
    );

    $("#dontShowIfIsNotValidText").onchange = (e) => {
      twpConfig.set(
        "dontShowIfIsNotValidText",
        e.target.checked ? "yes" : "no"
      );
    };
    $("#dontShowIfIsNotValidText").checked =
      twpConfig.get("dontShowIfIsNotValidText") === "yes" ? true : false;

    $("#dontShowIfPageLangIsTargetLang").onchange = (e) => {
      twpConfig.set(
        "dontShowIfPageLangIsTargetLang",
        e.target.checked ? "yes" : "no"
      );
    };
    $("#dontShowIfPageLangIsTargetLang").checked =
      twpConfig.get("dontShowIfPageLangIsTargetLang") === "yes" ? true : false;

    $("#dontShowIfPageLangIsUnknown").onchange = (e) => {
      twpConfig.set(
        "dontShowIfPageLangIsUnknown",
        e.target.checked ? "yes" : "no"
      );
    };
    $("#dontShowIfPageLangIsUnknown").checked =
      twpConfig.get("dontShowIfPageLangIsUnknown") === "yes" ? true : false;

    $("#dontShowIfSelectedTextIsTargetLang").onchange = (e) => {
      twpConfig.set(
        "dontShowIfSelectedTextIsTargetLang",
        e.target.checked ? "yes" : "no"
      );
    };
    $("#dontShowIfSelectedTextIsTargetLang").checked =
      twpConfig.get("dontShowIfSelectedTextIsTargetLang") === "yes"
        ? true
        : false;

    $("#dontShowIfSelectedTextIsUnknown").onchange = (e) => {
      twpConfig.set(
        "dontShowIfSelectedTextIsUnknown",
        e.target.checked ? "yes" : "no"
      );
    };
    $("#dontShowIfSelectedTextIsUnknown").checked =
      twpConfig.get("dontShowIfSelectedTextIsUnknown") === "yes" ? true : false;

    // style options
    $("#useOldPopup").onchange = (e) => {
      twpConfig.set("useOldPopup", e.target.value);
      updateDarkMode();
    };
    $("#useOldPopup").value = twpConfig.get("useOldPopup");

    $("#darkMode").onchange = (e) => {
      twpConfig.set("darkMode", e.target.value);
      updateDarkMode();
    };
    $("#darkMode").value = twpConfig.get("darkMode");

    $("#popupBlueWhenSiteIsTranslated").onchange = (e) => {
      twpConfig.set("popupBlueWhenSiteIsTranslated", e.target.value);
    };
    $("#popupBlueWhenSiteIsTranslated").value = twpConfig.get(
      "popupBlueWhenSiteIsTranslated"
    );

    // hotkeys options
    function escapeHtml(unsafe) {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
    $('[data-i18n="lblTranslateSelectedWhenPressTwice"]').innerHTML = $(
      '[data-i18n="lblTranslateSelectedWhenPressTwice"]'
    ).innerHTML.replace("[Ctrl]", "<kbd>Ctrl</kbd>");
    $('[data-i18n="lblTranslateTextOverMouseWhenPressTwice"]').innerHTML = $(
      '[data-i18n="lblTranslateTextOverMouseWhenPressTwice"]'
    ).innerHTML.replace("[Ctrl]", "<kbd>Ctrl</kbd>");

    $("#openNativeShortcutManager").onclick = (e) => {
      tabsCreate("chrome://extensions/shortcuts");
    };

    $("#translateSelectedWhenPressTwice").onclick = (e) => {
      twpConfig.set(
        "translateSelectedWhenPressTwice",
        e.target.checked ? "yes" : "no"
      );
    };
    $("#translateSelectedWhenPressTwice").checked =
      twpConfig.get("translateSelectedWhenPressTwice") === "yes";

    $("#translateTextOverMouseWhenPressTwice").onclick = (e) => {
      twpConfig.set(
        "translateTextOverMouseWhenPressTwice",
        e.target.checked ? "yes" : "no"
      );
    };
    $("#translateTextOverMouseWhenPressTwice").checked =
      twpConfig.get("translateTextOverMouseWhenPressTwice") === "yes";

    const defaultShortcuts = {};
    for (const name of Object.keys(
      chrome.runtime.getManifest().commands || {}
    )) {
      const info = chrome.runtime.getManifest().commands[name];
      if (info.suggested_key && info.suggested_key.default) {
        defaultShortcuts[name] = info.suggested_key.default;
      } else {
        defaultShortcuts[name] = "";
      }
    }

    function translateHotkeysDescription(hotkeyname) {
      const descriptions = [
        {
          key: "hotkey-toggle-translation",
          i18n: "lblSwitchTranslatedAndOriginal",
        },
        {
          key: "hotkey-translate-selected-text",
          i18n: "msgTranslateSelectedText",
        },
        {
          key: "hotkey-swap-page-translation-service",
          i18n: "swapTranslationService",
        },
        {
          key: "hotkey-show-original",
          i18n: "lblRestorePageToOriginal",
        },
        {
          key: "hotkey-translate-page-1",
          i18n: "lblTranslatePageToTargetLanguage",
        },
        {
          key: "hotkey-translate-page-2",
          i18n: "lblTranslatePageToTargetLanguage",
        },
        {
          key: "hotkey-translate-page-3",
          i18n: "lblTranslatePageToTargetLanguage",
        },
        {
          key: "hotkey-hot-translate-selected-text",
          i18n: "lblHotTranslatedSelectedText",
        },
      ];

      const info = descriptions.find((d) => d.key === hotkeyname);
      if (!info) return "";
      let desc = twpI18n.getMessage(info.i18n);
      if (hotkeyname.startsWith("hotkey-translate-page-")) {
        desc += " " + hotkeyname.slice(-1);
      }
      return desc;
    }

    function addHotkey(hotkeyname, description) {
      if (hotkeyname === "_execute_browser_action" && !description) {
        description = "Enable the extension";
      }
      description = translateHotkeysDescription(hotkeyname) || description;

      const enterShortcut =
        twpI18n.getMessage("enterShortcut") || "Enter shortcut";

      function escapeHtml(unsafe) {
        return unsafe
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }
      description = escapeHtml(description);

      const li = document.createElement("li");
      li.classList.add("shortcut-row");
      li.setAttribute("id", hotkeyname);
      li.innerHTML = `
        <div>${description}</div>
        <div class="shortcut-input-options">
            <div style="position: relative;">
                <input name="input" class="w3-input w3-border shortcut-input" type="text" readonly placeholder="${enterShortcut}" data-i18n-placeholder="enterShortcut">
                <p name="error" class="shortcut-error" style="position: absolute;"></p>
            </div>
            <div class="w3-hover-light-grey shortcut-button" name="removeKey"><i class="gg-trash"></i></div>
            <div class="w3-hover-light-grey shortcut-button" name="resetKey"><i class="gg-sync"></i></div>
        </div>  
        `;
      $("#KeyboardShortcuts").appendChild(li);

      const input = li.querySelector(`[name="input"]`);
      const error = li.querySelector(`[name="error"]`);
      const removeKey = li.querySelector(`[name="removeKey"]`);
      const resetKey = li.querySelector(`[name="resetKey"]`);

      input.value = twpConfig.get("hotkeys")[hotkeyname];
      if (input.value) {
        resetKey.style.display = "none";
      } else {
        removeKey.style.display = "none";
      }

      function setError(errorname) {
        const text = twpI18n.getMessage("hotkeyError_" + errorname);
        switch (errorname) {
          case "ctrlOrAlt":
            error.textContent = text ? text : "Include Ctrl or Alt";
            break;
          case "letter":
            error.textContent = text ? text : "Type a letter";
            break;
          case "invalid":
            error.textContent = text ? text : "Invalid combination";
            break;
          default:
            error.textContent = "";
            break;
        }
      }

      function getKeyString(e) {
        let result = "";
        if (e.ctrlKey) {
          result += "Ctrl+";
        }
        if (e.altKey) {
          result += "Alt+";
        }
        if (e.shiftKey) {
          result += "Shift+";
        }
        if (e.code.match(/Key([A-Z])/)) {
          result += e.code.match(/Key([A-Z])/)[1];
        } else if (e.code.match(/Digit([0-9])/)) {
          result += e.code.match(/Digit([0-9])/)[1];
        }

        return result;
      }

      function setShortcut(name, keystring) {
        const hotkeys = twpConfig.get("hotkeys");
        hotkeys[hotkeyname] = keystring;
        twpConfig.set("hotkeys", hotkeys);
        browser.commands.update({
          name: name,
          shortcut: keystring,
        });
      }

      function onkeychange(e) {
        input.value = getKeyString(e);

        if (e.Key == "Tab") {
          return;
        }
        if (e.key == "Escape") {
          input.blur();
          return;
        }
        if (e.key == "Backspace" || e.key == "Delete") {
          setShortcut(hotkeyname, getKeyString(e));
          input.blur();
          return;
        }
        if (!e.ctrlKey && !e.altKey) {
          setError("ctrlOrAlt");
          return;
        }
        if (e.ctrlKey && e.altKey && e.shiftKey) {
          setError("invalid");
          return;
        }
        e.preventDefault();
        if (!e.code.match(/Key([A-Z])/) && !e.code.match(/Digit([0-9])/)) {
          setError("letter");
          return;
        }

        setShortcut(hotkeyname, getKeyString(e));
        input.blur();

        setError("none");
      }

      input.onkeydown = (e) => onkeychange(e);
      input.onkeyup = (e) => onkeychange(e);

      input.onfocus = (e) => {
        input.value = "";
        setError("");
      };

      input.onblur = (e) => {
        input.value = twpConfig.get("hotkeys")[hotkeyname];
        setError("");
      };

      removeKey.onclick = (e) => {
        input.value = "";
        setShortcut(hotkeyname, "");

        removeKey.style.display = "none";
        resetKey.style.display = "block";
      };

      resetKey.onclick = (e) => {
        input.value = defaultShortcuts[hotkeyname];
        setShortcut(hotkeyname, defaultShortcuts[hotkeyname]);

        removeKey.style.display = "block";
        resetKey.style.display = "none";
      };

      //*
      if (typeof browser === "undefined") {
        input.setAttribute("disabled", "");
        resetKey.style.display = "none";
        removeKey.style.display = "none";
      } else {
        $("#openNativeShortcutManager").style.display = "none";
      }
      // */
    }

    if (typeof chrome.commands !== "undefined") {
      chrome.commands.getAll((results) => {
        for (const result of results) {
          addHotkey(result.name, result.description);
        }
      });
    }

    // privacy options
    $("#useAlternativeService").oninput = (e) => {
      twpConfig.set("useAlternativeService", e.target.value);
    };
    $("#useAlternativeService").value = twpConfig.get("useAlternativeService");

    {
      if (platformInfo.isMobile.any) {
        $("#btnEnableDeepL").setAttribute("disabled", "");
      }

      const updateServiceSelector = (enabledServices) => {
        document
          .querySelectorAll("#pageTranslatorService option")
          .forEach((option) => option.setAttribute("hidden", ""));
        document
          .querySelectorAll("#textTranslatorService option")
          .forEach((option) => option.setAttribute("hidden", ""));
        enabledServices.forEach((svName) => {
          let option;
          option = $(`#pageTranslatorService option[value="${svName}"]`);
          if (option) {
            option.removeAttribute("hidden");
          }
          option = $(`#textTranslatorService option[value="${svName}"]`);
          if (option) {
            option.removeAttribute("hidden");
          }
        });
      };

      const servicesInfo = [
        { selector: "#btnEnableGoogle", svName: "google" },
        { selector: "#btnEnableBing", svName: "bing" },
        { selector: "#btnEnableYandex", svName: "yandex" },
        { selector: "#btnEnableDeepL", svName: "deepl" },
      ];

      servicesInfo.forEach((svInfo) => {
        $(svInfo.selector).oninput = (e) => {
          const enabledServices = [];
          let enabledCount = 0;
          servicesInfo.forEach((_svInfo) => {
            if ($(_svInfo.selector).checked) {
              enabledCount++;
            }
          });
          if (
            enabledCount === 0 ||
            (enabledCount === 1 && $("#btnEnableDeepL").checked)
          ) {
            if (e.target === $("#btnEnableGoogle")) {
              $("#btnEnableBing").checked = true;
            } else {
              $("#btnEnableGoogle").checked = true;
            }
          }
          servicesInfo.forEach((_svInfo) => {
            if ($(_svInfo.selector).checked) {
              enabledServices.push(_svInfo.svName);
            }
          });

          if (
            !enabledServices.includes(twpConfig.get("textTranslatorService"))
          ) {
            twpConfig.set("textTranslatorService", enabledServices[0]);
          }
          if (
            !enabledServices.includes(twpConfig.get("pageTranslatorService"))
          ) {
            twpConfig.set("pageTranslatorService", enabledServices[0]);
          }

          const pageTranslationServices = ["google", "bing", "yandex"];
          chrome.runtime.sendMessage(
            {
              action: "restorePagesWithServiceNames",
              serviceNames: pageTranslationServices.filter(
                (svName) => !enabledServices.includes(svName)
              ),
              newServiceName: twpConfig.get("pageTranslatorService"),
            },
            checkedLastError
          );

          twpConfig.set("enabledServices", enabledServices);

          $("#pageTranslatorService").value = twpConfig.get(
            "pageTranslatorService"
          );
          $("#textTranslatorService").value = twpConfig.get(
            "textTranslatorService"
          );
          updateServiceSelector(enabledServices);
        };
        $(svInfo.selector).checked =
          twpConfig.get("enabledServices").indexOf(svInfo.svName) === -1
            ? false
            : true;

        updateServiceSelector(twpConfig.get("enabledServices"));
      });
    }

    // storage options
    $("#deleteTranslationCache").onclick = (e) => {
      if (confirm(twpI18n.getMessage("doYouWantToDeleteTranslationCache"))) {
        chrome.runtime.sendMessage(
          {
            action: "deleteTranslationCache",
            reload: true,
          },
          checkedLastError
        );
      }
    };

    $("#enableDiskCache").oninput = (e) => {
      twpConfig.set("enableDiskCache", $("#enableDiskCache").value);
    };
    $("#enableDiskCache").value = twpConfig.get("enableDiskCache");

    $("#backupToFile").onclick = (e) => {
      const configJSON = twpConfig.export();

      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(configJSON)
      );
      element.setAttribute(
        "download",
        "twp-backup_" +
          new Date()
            .toISOString()
            .replace(/T/, "_")
            .replace(/\..+/, "")
            .replace(/\:/g, ".") +
          ".txt"
      );

      element.style.display = "none";
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    };
    $("#restoreFromFile").onclick = (e) => {
      const element = document.createElement("input");
      element.setAttribute("type", "file");
      element.setAttribute("accept", "text/plain");

      element.style.display = "none";
      document.body.appendChild(element);

      element.oninput = (e) => {
        const input = e.target;

        const reader = new FileReader();
        reader.onload = function () {
          try {
            if (confirm(twpI18n.getMessage("doYouWantOverwriteAllSettings"))) {
              twpConfig.import(reader.result);
            }
          } catch (e) {
            alert(twpI18n.getMessage("fileIsCorrupted"));
            console.error(e);
          }
        };

        reader.readAsText(input.files[0]);
      };

      element.click();

      document.body.removeChild(element);
    };
    $("#resetToDefault").onclick = (e) => {
      if (confirm(twpI18n.getMessage("doYouWantRestoreSettings"))) {
        twpConfig.restoreToDefault();
      }
    };

    // others options
    $("#showReleaseNotes").onchange = (e) => {
      twpConfig.set("showReleaseNotes", e.target.value);
    };
    $("#showReleaseNotes").value = twpConfig.get("showReleaseNotes");

    $("#whenShowMobilePopup").onchange = (e) => {
      twpConfig.set("whenShowMobilePopup", e.target.value);
    };
    $("#whenShowMobilePopup").value = twpConfig.get("whenShowMobilePopup");

    $("#showTranslatePageContextMenu").onchange = (e) => {
      twpConfig.set("showTranslatePageContextMenu", e.target.value);
    };
    $("#showTranslatePageContextMenu").value = twpConfig.get(
      "showTranslatePageContextMenu"
    );

    $("#showTranslateSelectedContextMenu").onchange = (e) => {
      twpConfig.set("showTranslateSelectedContextMenu", e.target.value);
    };
    $("#showTranslateSelectedContextMenu").value = twpConfig.get(
      "showTranslateSelectedContextMenu"
    );

    $("#showButtonInTheAddressBar").onchange = (e) => {
      twpConfig.set("showButtonInTheAddressBar", e.target.value);
    };
    $("#showButtonInTheAddressBar").value = twpConfig.get(
      "showButtonInTheAddressBar"
    );

    $("#translateClickingOnce").onchange = (e) => {
      twpConfig.set("translateClickingOnce", e.target.value);
    };
    $("#translateClickingOnce").value = twpConfig.get("translateClickingOnce");

    $("#btnCalculateStorage").style.display = "inline-block";
    $("#storageUsed").style.display = "none";
    $("#btnCalculateStorage").onclick = (e) => {
      $("#btnCalculateStorage").style.display = "none";

      chrome.runtime.sendMessage(
        {
          action: "getCacheSize",
        },
        (result) => {
          checkedLastError();

          $("#storageUsed").textContent = result;
          $("#storageUsed").style.display = "inline-block";
        }
      );
    };

    // experimental options
    $("#addLibre").onclick = () => {
      const libre = {
        name: "libre",
        url: $("#libreURL").value,
        apiKey: $("#libreKEY").value,
      };
      try {
        new URL(libre.url);
        if (libre.apiKey.length < 10) {
          throw new Error("Provides an API Key");
        }

        const customServices = twpConfig.get("customServices");

        const index = customServices.findIndex((cs) => cs.name === "libre");
        if (index !== -1) {
          customServices.splice(index, 1);
        }

        customServices.push(libre);
        twpConfig.set("customServices", customServices);
        chrome.runtime.sendMessage({ action: "createLibreService", libre });
      } catch (e) {
        alert(e);
      }
    };

    $("#removeLibre").onclick = () => {
      const customServices = twpConfig.get("customServices");
      const index = customServices.findIndex((cs) => cs.name === "libre");

      if (index !== -1) {
        customServices.splice(index, 1);
        twpConfig.set("customServices", customServices);
        chrome.runtime.sendMessage(
          { action: "removeLibreService" },
          checkedLastError
        );
      }

      if (twpConfig.get("textTranslatorService") === "libre") {
        twpConfig.set(
          "textTranslatorService",
          twpConfig.get("pageTranslatorService")
        );
      }

      $("#libreURL").value = "";
      $("#libreKEY").value = "";
    };

    const libre = twpConfig
      .get("customServices")
      .find((cs) => cs.name === "libre");
    if (libre) {
      $("#libreURL").value = libre.url;
      $("#libreKEY").value = libre.apiKey;
    }

    // Detect DeepLX API version from URL
    function detectDeepLXVersion(apiUrl) {
      if (apiUrl.endsWith('/v2/translate')) return 'v2';
      if (apiUrl.endsWith('/v1/translate')) return 'v1';
      if (apiUrl.endsWith('/translate')) return 'free';
      return null;
    }

    // Test DeepLX API with a simple translation request
    async function testDeepLXApi(config) {
      return await new Promise((resolve) => {
        const version = detectDeepLXVersion(config.apiUrl);
        if (!version) {
          resolve(null);
          return;
        }

        const xhttp = new XMLHttpRequest();
        xhttp.open("POST", config.apiUrl);
        xhttp.responseType = "json";
        xhttp.setRequestHeader("Content-Type", "application/json");

        // Set authorization header based on version
        if (version === 'v2') {
          xhttp.setRequestHeader("Authorization", "DeepL-Auth-Key " + (config.apiKey || ""));
        } else {
          if (config.apiKey) {
            xhttp.setRequestHeader("Authorization", "Bearer " + config.apiKey);
          }
        }

        // Prepare request body based on version
        let requestBody;
        if (version === 'v2') {
          requestBody = JSON.stringify({
            text: ["Hello"],
            target_lang: "ZH"
          });
        } else {
          requestBody = JSON.stringify({
            text: "Hello",
            source_lang: "EN",
            target_lang: "ZH"
          });
        }

        xhttp.onload = () => {
          if (xhttp.status === 200 && xhttp.response && xhttp.response.code === 200) {
            resolve(xhttp.response);
          } else {
            resolve(null);
          }
        };
        xhttp.onerror = () => resolve(null);
        xhttp.send(requestBody);
      });
    }

    async function testDeepLFreeApiKey(apiKey) {
      return await new Promise((resolve) => {
        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", "https://api-free.deepl.com/v2/usage");
        xhttp.responseType = "json";
        xhttp.setRequestHeader("Authorization", "DeepL-Auth-Key " + apiKey);
        xhttp.onload = () => {
          resolve(xhttp.response);
        };
        xhttp.send();
      });
    }

    // Unified test function for both DeepL and DeepLX
    async function testDeepLService(config) {
      if (config.isDeepLX) {
        return await testDeepLXApi(config);
      } else {
        return await testDeepLFreeApiKey(config.apiKey);
      }
    }

    // Track original configuration for change detection
    let originalConfig = null;
    let currentServiceType = 'official';

    // Show status message with auto-hide
    function showStatusMessage(message, isError = false) {
      const statusDiv = $("#deeplStatusMessage");
      statusDiv.style.display = "block";
      statusDiv.textContent = message;

      if (isError) {
        statusDiv.style.color = "#d32f2f";
      } else {
        statusDiv.style.color = "#388e3c";
      }

      // Auto-hide after 3 seconds
      setTimeout(() => {
        statusDiv.style.display = "none";
      }, 3000);
    }

    // Check if configuration has changed
    function hasConfigChanged() {
      const isDeepLX = currentServiceType === 'deeplx';
      const apiKey = $("#deeplKEY").value;
      const apiUrl = $("#deeplxURL").value;

      if (!originalConfig) {
        // No original config, check if user has entered any data
        if (isDeepLX) {
          return apiUrl.trim() !== "" || apiKey.trim() !== "";
        } else {
          return apiKey.trim() !== "";
        }
      }

      // Compare with original config
      if (originalConfig.isDeepLX !== isDeepLX) return true;
      if (originalConfig.apiKey !== apiKey) return true;
      if (isDeepLX && originalConfig.apiUrl !== apiUrl) return true;

      return false;
    }

    // Update button state based on changes
    function updateButtonState() {
      const addButton = $("#addDeepL");
      if (hasConfigChanged()) {
        addButton.disabled = false;
        addButton.style.opacity = "1";
        addButton.style.cursor = "pointer";
      } else {
        addButton.disabled = true;
        addButton.style.opacity = "0.5";
        addButton.style.cursor = "not-allowed";
      }
    }

    // Switch between DeepL tabs
    function switchDeepLTab(type) {
      currentServiceType = type;
      const isDeepLX = type === 'deeplx';

      // Update tab appearance
      $("#deeplOfficialTab").classList.toggle('active', !isDeepLX);
      $("#deeplxTab").classList.toggle('active', isDeepLX);

      // Update UI
      const deeplxUrlSection = $("#deeplxUrlSection");
      const deeplKeyLabel = $("#deeplKeyLabel");
      const deeplKEY = $("#deeplKEY");
      const addButton = $("#addDeepL");
      const removeButton = $("#removeDeepL");

      if (isDeepLX) {
        deeplxUrlSection.style.display = "block";
        deeplKeyLabel.textContent = "Access Token (optional)";
        deeplKEY.placeholder = "your_access_token";
        addButton.textContent = "Add DeepLX Service";
        removeButton.textContent = "Remove DeepLX Service";
      } else {
        deeplxUrlSection.style.display = "none";
        deeplKeyLabel.textContent = "Your API key";
        deeplKEY.placeholder = "7cad3e19-32b8-4cac-a03d-64f3c1e1c1be:fx";
        addButton.textContent = "Add DeepL Service";
        removeButton.textContent = "Remove DeepL Service";
      }

      updateButtonState();
    }

    // Add tab click listeners
    $("#deeplOfficialTab").onclick = () => switchDeepLTab('official');
    $("#deeplxTab").onclick = () => switchDeepLTab('deeplx');

    // Add change listeners to inputs
    $("#deeplKEY").oninput = updateButtonState;
    $("#deeplxURL").oninput = updateButtonState;

    $("#addDeepL").onclick = async () => {
      if ($("#addDeepL").disabled) return;

      const isDeepLX = currentServiceType === 'deeplx';
      const apiKey = $("#deeplKEY").value;

      let deepl_config;
      if (isDeepLX) {
        const apiUrl = $("#deeplxURL").value.trim();
        if (!apiUrl) {
          showStatusMessage("Please enter DeepLX API URL", true);
          return;
        }

        const version = detectDeepLXVersion(apiUrl);
        if (!version) {
          showStatusMessage("Invalid DeepLX API URL. Must end with /translate, /v1/translate, or /v2/translate", true);
          return;
        }

        deepl_config = {
          name: "deepl_freeapi",
          apiKey: apiKey || "",
          isDeepLX: true,
          apiUrl: apiUrl,
          version: version
        };
      } else {
        if (!apiKey) {
          showStatusMessage("Please enter DeepL API key", true);
          return;
        }
        deepl_config = {
          name: "deepl_freeapi",
          apiKey: apiKey,
          isDeepLX: false
        };
      }

      try {
        // Test configuration silently in background
        const response = await testDeepLService(deepl_config);
        if (response) {
          // Test successful - save configuration and show success message
          const customServices = twpConfig.get("customServices");

          const index = customServices.findIndex(
            (cs) => cs.name === "deepl_freeapi"
          );
          if (index !== -1) {
            customServices.splice(index, 1);
          }

          customServices.push(deepl_config);
          twpConfig.set("customServices", customServices);
          chrome.runtime.sendMessage({
            action: "createDeeplFreeApiService",
            deepl_freeapi: deepl_config,
          });

          // Update original config and button state
          originalConfig = { ...deepl_config };
          updateButtonState();

          // Only show that configuration was saved, no mention of testing
          showStatusMessage("Configuration saved successfully!", false);
        } else {
          // Test failed - show error message
          showStatusMessage(isDeepLX ? "Configuration invalid. Please check your DeepLX URL and token." : "Invalid API key. Please check your configuration.", true);
        }
      } catch (e) {
        showStatusMessage("Configuration invalid. Please check your settings.", true);
      }
    };

    $("#removeDeepL").onclick = () => {
      const customServices = twpConfig.get("customServices");
      const index = customServices.findIndex(
        (cs) => cs.name === "deepl_freeapi"
      );
      if (index !== -1) {
        customServices.splice(index, 1);
        twpConfig.set("customServices", customServices);
        chrome.runtime.sendMessage(
          { action: "removeDeeplFreeApiService" },
          checkedLastError
        );
      }
      // Reset UI to default state
      currentServiceType = 'official';
      originalConfig = null;
      switchDeepLTab('official');
      $("#deeplKEY").value = "";
      $("#deeplxURL").value = "";
      $("#deeplStatusMessage").style.display = "none";
      updateButtonState();
    };

    // Load existing configuration
    const deepl_freeapi = twpConfig
      .get("customServices")
      .find((cs) => cs.name === "deepl_freeapi");
    if (deepl_freeapi) {
      originalConfig = { ...deepl_freeapi };
      $("#deeplKEY").value = deepl_freeapi.apiKey || "";

      if (deepl_freeapi.isDeepLX) {
        currentServiceType = 'deeplx';
        switchDeepLTab('deeplx');
        $("#deeplxURL").value = deepl_freeapi.apiUrl || "";
      } else {
        currentServiceType = 'official';
        switchDeepLTab('official');
      }

      updateButtonState();

      // Silently test configuration in background (no UI feedback unless it fails)
      testDeepLService(deepl_freeapi).then((response) => {
        if (!response) {
          showStatusMessage("Current configuration may have issues. Please check and re-save.", true);
        }
      }).catch(() => {
        // Ignore test errors on load
      });
    } else {
      // No existing config, ensure button is disabled initially
      updateButtonState();
    }

    $("#showMobilePopupOnDesktop").onchange = (e) => {
      twpConfig.set("showMobilePopupOnDesktop", e.target.value);
    };
    $("#showMobilePopupOnDesktop").value = twpConfig.get(
      "showMobilePopupOnDesktop"
    );

    $("#addPaddingToPage").onchange = (e) => {
      twpConfig.set("addPaddingToPage", e.target.value);
    };
    $("#addPaddingToPage").value = twpConfig.get("addPaddingToPage");

    $("#btnShowProxyConfiguration").onclick = (e) => {
      $("#googleProxyContainer").style.display = "block";
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    };

    $("#addGoogleProxy").onclick = (e) => {
      try {
        const inputTranslationServer = $(
          "#googleTranslateProxyServer"
        ).value.trim();
        const inputTtsServer = $("#googleTtsProxyServer").value.trim();
        const translateServer = inputTranslationServer
          ? new URL("https://" + inputTranslationServer).host
          : null;
        const ttsServer = inputTtsServer
          ? new URL("https://" + inputTtsServer).host
          : null;

        const proxyServers = twpConfig.get("proxyServers");
        proxyServers.google = {
          translateServer,
          ttsServer,
        };
        console.info("proxyServers: ", proxyServers);
        twpConfig.set("proxyServers", proxyServers);

        $("#googleTranslateProxyServer").value = translateServer;
        $("#googleTtsProxyServer").value = ttsServer;
      } catch (e) {
        alert(e);
      }
    };

    $("#removeGoogleProxy").onclick = (e) => {
      const proxyServers = twpConfig.get("proxyServers");
      delete proxyServers.google;
      twpConfig.set("proxyServers", proxyServers);

      $("#googleTranslateProxyServer").value = "";
      $("#googleTtsProxyServer").value = "";
    }

    const googleProxy = twpConfig.get("proxyServers").google;
    if (googleProxy) {
      $("#googleTranslateProxyServer").value = googleProxy.translateServer;
      $("#googleTtsProxyServer").value = googleProxy.ttsServer;
    }

    // donation options
    if (navigator.language === "pt-BR") {
      $("#currency").value = "BRL";
      $("#donateInUSD").style.display = "none";
    } else {
      $("#currency").value = "USD";
      $("#donateInBRL").style.display = "none";
    }

    $("#currency").onchange = (e) => {
      if (e.target.value === "BRL") {
        $("#donateInUSD").style.display = "none";
        $("#donateInBRL").style.display = "block";
      } else {
        $("#donateInUSD").style.display = "block";
        $("#donateInBRL").style.display = "none";
      }
    };
  });

window.scrollTo({
  top: 0,
});
