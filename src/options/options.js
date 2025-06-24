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

    // Note: favoriteLanguage1, favoriteLanguage2, favoriteLanguage3 are now dynamically generated
    // and filled in updatePreferredLanguagesList()

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
      twpConfig.setTargetLanguage(e.target.value);
      location.reload();
    };

    const targetLanguageTextTranslation = twpConfig.get(
      "targetLanguageTextTranslation"
    );
    $("#selectTargetLanguageForText").value = targetLanguageTextTranslation;
    $("#selectTargetLanguageForText").onchange = (e) => {
      twpConfig.setTargetLanguage(e.target.value, true);
      twpConfig.setTargetLanguage(targetLanguage, false);
      location.reload();
    };

    // Dynamic preferred languages management
    /**
     * Creates a DOM element for a preferred language item
     * @param {string} langCode - The language code
     * @param {number} index - The index of this language in the list
     * @param {Array} targetLanguages - The current list of target languages (to avoid redundant API calls)
     * @returns {HTMLElement} The created list item element
     */
    function createPreferredLanguageItem(langCode, index, targetLanguages) {
      const li = document.createElement("li");
      li.setAttribute("class", "w3-row");
      li.setAttribute("data-index", index.toString());

      const labelDiv = document.createElement("div");
      labelDiv.setAttribute("class", "w3-quarter");
      const label = document.createElement("p");
      label.textContent = twpI18n.getMessage("lblFavoriteLanguage", (index + 1).toString()) || `Favorite language ${index + 1}`;
      labelDiv.appendChild(label);

      const selectDiv = document.createElement("div");
      selectDiv.setAttribute("class", "w3-half");
      const select = document.createElement("select");
      select.setAttribute("class", "w3-select w3-border w3-round");
      select.setAttribute("data-index", index.toString());

      // Populate select with language options using existing fillLanguageList function
      fillLanguageList(select);
      select.value = langCode;

      select.onchange = (e) => {
        const success = twpConfig.updatePreferredLanguage(index, select.value);
        if (!success) {
          // Revert if update failed (duplicate language)
          select.value = langCode;
          alert(twpI18n.getMessage("msgLanguageAlreadySelected") || "This language is already selected");
        } else {
          location.reload();
        }
      };

      selectDiv.appendChild(select);

      const buttonDiv = document.createElement("div");
      buttonDiv.setAttribute("class", "w3-quarter");

      // Remove button (only show if more than 1 language)
      if (targetLanguages.length > 1) {
        const removeBtn = document.createElement("button");
        removeBtn.setAttribute("class", "w3-button w3-red w3-round w3-margin-left");
        removeBtn.textContent = "×";
        removeBtn.title = twpI18n.getMessage("lblRemove") || "Remove";
        removeBtn.onclick = () => {
          const success = twpConfig.removePreferredLanguage(index);
          if (success) {
            location.reload();
          }
        };
        buttonDiv.appendChild(removeBtn);
      }

      li.appendChild(labelDiv);
      li.appendChild(selectDiv);
      li.appendChild(buttonDiv);

      return li;
    }

    function updatePreferredLanguagesList() {
      const targetLanguages = twpConfig.get("targetLanguages");
      const container = $("#preferredLanguagesList");
      container.innerHTML = "";

      targetLanguages.forEach((langCode, index) => {
        const li = createPreferredLanguageItem(langCode, index, targetLanguages);
        container.appendChild(li);
      });

      // Show/hide add button
      updateAddButtonVisibility(targetLanguages);
    }

    function updateAddButtonVisibility(targetLanguages) {
      const addBtn = $("#addPreferredLanguage");
      if (targetLanguages.length < 3) {
        addBtn.style.display = "inline-block";
      } else {
        addBtn.style.display = "none";
      }
    }

    // Add language button handler
    $("#addPreferredLanguage").onclick = () => {
      const langs = twpLang.getLanguageList();
      const targetLanguages = twpConfig.get("targetLanguages");

      // Check if we can add more languages
      if (targetLanguages.length >= 3) {
        alert(twpI18n.getMessage("msgMaxLanguagesReached") || "Maximum number of preferred languages reached (3)");
        return;
      }

      // Find first available language not in current list
      let newLang = null;
      for (const langCode in langs) {
        if (targetLanguages.indexOf(langCode) === -1) {
          newLang = langCode;
          break;
        }
      }

      if (newLang) {
        const success = twpConfig.addPreferredLanguage(newLang);
        if (success) {
          location.reload();
        } else {
          alert(twpI18n.getMessage("msgFailedToAddLanguage") || "Failed to add language. Please try again.");
        }
      } else {
        alert(twpI18n.getMessage("msgNoMoreLanguagesAvailable") || "No more languages available to add.");
      }
    };

    // Initialize preferred languages list
    updatePreferredLanguagesList();

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

        // Show enabled built-in services
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

        // Show custom services that are configured
        const customServices = twpConfig.get("customServices");
        customServices.forEach((cs) => {
          let option;
          option = $(`#pageTranslatorService option[value="${cs.name}"]`);
          if (option) {
            option.removeAttribute("hidden");
          }
          option = $(`#textTranslatorService option[value="${cs.name}"]`);
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

    // DeepLX checkbox handling (custom service)
    {
      const updateDeepLXCheckbox = () => {
        const deeplxService = twpConfig.get("customServices").find((cs) => cs.name === "deeplx");
        $("#btnEnableDeepLX").checked = !!deeplxService;
        $("#btnEnableDeepLX").disabled = !deeplxService;
      };

      $("#btnEnableDeepLX").oninput = (e) => {
        const deeplxService = twpConfig.get("customServices").find((cs) => cs.name === "deeplx");
        if (!deeplxService) {
          e.target.checked = false;
          alert("Please configure DeepLX service first in the Experimental section.");
          return;
        }
        // DeepLX checkbox is just for display, actual control is in customServices
      };

      // Initialize DeepLX checkbox state
      updateDeepLXCheckbox();

      // We'll update the checkbox when DeepLX service is added/removed
      // This will be handled by modifying the existing add/remove functions
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

    $("#addDeepL").onclick = async () => {
      const deepl_freeapi = {
        name: "deepl_freeapi",
        apiKey: $("#deeplKEY").value,
      };
      try {
        const response = await testDeepLFreeApiKey(deepl_freeapi.apiKey);
        $("#deeplApiResponse").textContent = JSON.stringify(response);
        if (response) {
          const customServices = twpConfig.get("customServices");

          const index = customServices.findIndex(
            (cs) => cs.name === "deepl_freeapi"
          );
          if (index !== -1) {
            customServices.splice(index, 1);
          }

          customServices.push(deepl_freeapi);
          twpConfig.set("customServices", customServices);
          chrome.runtime.sendMessage({
            action: "createDeeplFreeApiService",
            deepl_freeapi,
          });
        } else {
          alert("Invalid API key");
        }
      } catch (e) {
        alert(e);
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
      $("#deeplKEY").value = "";
      $("#deeplApiResponse").textContent = "";
    };

    const deepl_freeapi = twpConfig
      .get("customServices")
      .find((cs) => cs.name === "deepl_freeapi");
    if (deepl_freeapi) {
      $("#deeplKEY").value = deepl_freeapi.apiKey;
      testDeepLFreeApiKey(deepl_freeapi.apiKey).then((response) => {
        $("#deeplApiResponse").textContent = JSON.stringify(response);
      });
    }

    // Function to detect API version from URL
    const detectApiVersion = (url) => {
      if (url.includes("/v2/translate")) {
        return "official";
      } else if (url.includes("/v1/translate")) {
        return "pro";
      } else if (url.includes("/translate")) {
        return "free";
      } else {
        // If no translate endpoint specified, assume free version
        return "free";
      }
    };

    // Generate unique ID for services
    const generateServiceId = () => {
      return 'service_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    };

    // DeepLX Service Management
    let deeplxConfig = {
      name: "deeplx",
      services: [],
      loadBalanceStrategy: "random",
      retryCount: 3
    };

    // Load existing DeepLX config or migrate from single service
    const loadDeepLXConfig = () => {
      const customServices = twpConfig.get("customServices");

      // Check for existing service config
      const existingService = customServices.find(cs => cs.name === "deeplx");
      if (existingService) {
        // Check if it's already multi-service format
        if (existingService.services && Array.isArray(existingService.services)) {
          deeplxConfig = existingService;
        } else {
          // Migrate from single service format
          deeplxConfig.services = [{
            id: generateServiceId(),
            url: existingService.url,
            token: existingService.token || "",
            apiVersion: existingService.apiVersion || detectApiVersion(existingService.url),
            weight: 1,
            enabled: true
          }];
          deeplxConfig.loadBalanceStrategy = "random";
          deeplxConfig.retryCount = 3;
        }
      }
    };

    // Save DeepLX config
    const saveDeepLXConfig = () => {
      const customServices = twpConfig.get("customServices");
      const index = customServices.findIndex(cs => cs.name === "deeplx");

      if (index !== -1) {
        customServices[index] = deeplxConfig;
      } else {
        customServices.push(deeplxConfig);
      }

      twpConfig.set("customServices", customServices);

      // Update service in background - always use multi-service architecture
      if (deeplxConfig.services.length > 0) {
        chrome.runtime.sendMessage({
          action: "createDeepLXMultiService",
          deeplx: deeplxConfig
        });
      } else {
        chrome.runtime.sendMessage({ action: "removeDeepLXService" });
      }

      // Update UI
      updateDeepLXServicesList();
      updateDeepLXCheckbox();
      updateLoadBalanceVisibility();
    };

    // Update load balance visibility based on service count
    const updateLoadBalanceVisibility = () => {
      const hasMultipleServices = deeplxConfig.services.length > 1;
      const loadBalanceContainer = $("#loadBalanceContainer");
      const weightContainer = $("#weightContainer");

      if (hasMultipleServices) {
        loadBalanceContainer.style.display = "block";
        weightContainer.style.display = "block";
      } else {
        loadBalanceContainer.style.display = "none";
        weightContainer.style.display = "none";
      }
    };

    // Update services list display
    const updateDeepLXServicesList = () => {
      const container = $("#deeplxServicesContainer");

      if (deeplxConfig.services.length === 0) {
        container.innerHTML = '<p style="color: #666; font-style: italic;">No DeepLX endpoints configured</p>';
        return;
      }

      let html = '';
      deeplxConfig.services.forEach((service, index) => {
        let statusColor = service.enabled ? '#28a745' : '#6c757d';
        let statusIcon = service.enabled ? '●' : '○';
        let statusBadge = '';

        // Check for permanent errors
        if (service.permanentError) {
          statusColor = '#6f42c1'; // Purple for permanent errors
          statusIcon = '🚫';
          const errorCode = service.permanentErrorReason || 'ERROR';
          statusBadge = `<span style="background: #6f42c1; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.75em; margin-left: 8px;">${errorCode}</span>`;
        } else if (service.lastTestStatus === 'failed') {
          statusColor = '#dc3545'; // Red for failed tests
          statusIcon = '❌';
          // Extract error code or show "FAILED"
          const errorMatch = service.lastTestError ? service.lastTestError.match(/HTTP (\d+)/) : null;
          const errorCode = errorMatch ? errorMatch[1] : 'FAILED';
          statusBadge = `<span style="background: #dc3545; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.75em; margin-left: 8px;">${errorCode}</span>`;
        } else if (service.lastTestStatus === 'success') {
          statusIcon = service.enabled ? '✅' : '○';
        }

        const versionText = service.apiVersion === "free" ? "Free" :
                           service.apiVersion === "pro" ? "Pro" : "Official";

        // Show weight only for multiple services
        const weightDisplay = deeplxConfig.services.length > 1 ? ` | Weight: ${service.weight}` : '';

        // Truncate long URLs for display - make it shorter to save space
        const maxUrlLength = 35;
        const displayUrl = service.url.length > maxUrlLength ?
          service.url.substring(0, maxUrlLength) + '...' : service.url;

        html += `
          <div style="border: 1px solid #ddd; padding: 10px; margin: 5px 0; background-color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                  <strong style="color: ${statusColor};">${statusIcon} Endpoint ${index + 1}</strong>
                  ${statusBadge}
                  <span id="test-status-${service.id}" style="margin-left: 10px; font-size: 0.8em; display: none;"></span>
                </div>
                <div style="font-size: 0.9em; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  <span title="${service.url}" style="cursor: help;">${displayUrl}</span> | ${versionText}${weightDisplay}
                  ${service.token ? ' | Token: ●●●●' : ' | No Token'}
                </div>
              </div>
              <div>
                <button data-action="test" data-service-id="${service.id}" class="deeplx-btn deeplx-btn-small deeplx-btn-blue">
                  Test
                </button>
                <button data-action="edit" data-service-id="${service.id}" class="deeplx-btn deeplx-btn-small deeplx-btn-green">
                  Edit
                </button>
                <button data-action="toggle" data-service-id="${service.id}" class="deeplx-btn deeplx-btn-small ${service.enabled ? 'deeplx-btn-grey' : 'deeplx-btn-green'}">
                  ${service.enabled ? 'Disable' : 'Enable'}
                </button>
                <button data-action="remove" data-service-id="${service.id}" class="deeplx-btn deeplx-btn-small deeplx-btn-red deeplx-btn-last">
                  Remove
                </button>
              </div>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    };

    // Service management functions
    const toggleDeepLXService = (serviceId) => {
      const service = deeplxConfig.services.find(s => s.id === serviceId);
      if (service) {
        service.enabled = !service.enabled;
        saveDeepLXConfig();
      }
    };

    // Store original values for comparison and change listeners
    let originalEditValues = {};
    let editFormChangeListeners = null;

    const editDeepLXService = (serviceId) => {
      const service = deeplxConfig.services.find(s => s.id === serviceId);
      if (!service) return;

      // Store original values
      originalEditValues = {
        url: service.url,
        token: service.token || "",
        weight: service.weight || 1
      };

      // Fill form with current service data
      $("#deeplxURL").value = service.url;
      $("#deeplxTOKEN").value = service.token || "";
      $("#deeplxWeight").value = service.weight || 1;

      // Show editing state
      $("#deeplxApiResponse").textContent = `Editing endpoint: ${service.url.length > 50 ? service.url.substring(0, 50) + '...' : service.url}`;
      $("#deeplxApiResponse").style.color = "blue";

      // Change button text to indicate editing mode
      const addButton = $("#addDeepLXService");
      const cancelButton = $("#cancelEditDeepLX");
      addButton.textContent = "Update Endpoint";
      addButton.setAttribute('data-editing-id', serviceId);
      addButton.disabled = true; // Initially disabled since no changes
      addButton.style.opacity = "0.5";
      cancelButton.style.display = "inline-block";

      // Add change listeners to form fields
      setupEditFormChangeListeners();

      // Scroll to form
      document.querySelector('#deeplxURL').scrollIntoView({ behavior: 'smooth' });
    };

    const removeDeepLXService = (serviceId) => {
      const index = deeplxConfig.services.findIndex(s => s.id === serviceId);
      if (index !== -1) {
        deeplxConfig.services.splice(index, 1);
        saveDeepLXConfig();
      }
    };



    // Setup change listeners for edit form
    const setupEditFormChangeListeners = () => {
      // Remove existing listeners if they exist
      if (editFormChangeListeners) {
        $("#deeplxURL").removeEventListener('input', editFormChangeListeners);
        $("#deeplxTOKEN").removeEventListener('input', editFormChangeListeners);
        $("#deeplxWeight").removeEventListener('input', editFormChangeListeners);
      }

      // Create the change handler function
      editFormChangeListeners = () => {
        const currentValues = {
          url: $("#deeplxURL").value.trim(),
          token: $("#deeplxTOKEN").value.trim(),
          weight: parseInt($("#deeplxWeight").value) || 1
        };

        const hasChanges =
          currentValues.url !== originalEditValues.url ||
          currentValues.token !== originalEditValues.token ||
          currentValues.weight !== originalEditValues.weight;

        const addButton = $("#addDeepLXService");
        if (hasChanges) {
          addButton.disabled = false;
          addButton.style.opacity = "1";
        } else {
          addButton.disabled = true;
          addButton.style.opacity = "0.5";
        }
      };

      // Add new listeners
      $("#deeplxURL").addEventListener('input', editFormChangeListeners);
      $("#deeplxTOKEN").addEventListener('input', editFormChangeListeners);
      $("#deeplxWeight").addEventListener('input', editFormChangeListeners);
    };

    // Helper function to clear API response message after delay
    const clearApiResponseMessage = (delay = 3000) => {
      setTimeout(() => {
        $("#deeplxApiResponse").textContent = "";
      }, delay);
    };

    // Reset edit form to add mode
    const resetEditForm = () => {
      $("#deeplxURL").value = "";
      $("#deeplxTOKEN").value = "";
      $("#deeplxWeight").value = "1";
      const addButton = $("#addDeepLXService");
      addButton.textContent = "+ Add Endpoint";
      addButton.removeAttribute('data-editing-id');
      addButton.disabled = false;
      addButton.style.opacity = "1";
      $("#cancelEditDeepLX").style.display = "none";
      $("#deeplxApiResponse").textContent = "";

      // Clear original values
      originalEditValues = {};

      // Remove change listeners
      if (editFormChangeListeners) {
        $("#deeplxURL").removeEventListener('input', editFormChangeListeners);
        $("#deeplxTOKEN").removeEventListener('input', editFormChangeListeners);
        $("#deeplxWeight").removeEventListener('input', editFormChangeListeners);
        editFormChangeListeners = null;
      }
    };

    // Add new endpoint or update existing
    $("#addDeepLXService").onclick = async () => {
      const addButton = $("#addDeepLXService");

      // Check if button is disabled (no changes in edit mode)
      if (addButton.disabled) {
        return;
      }

      const urlValue = $("#deeplxURL").value.trim();
      const tokenValue = $("#deeplxTOKEN").value.trim();
      const weight = parseInt($("#deeplxWeight").value) || 1;
      const editingId = addButton.getAttribute('data-editing-id');

      if (!urlValue) {
        alert("Please provide a DeepLX API endpoint URL");
        return;
      }

      try {
        // More flexible URL validation
        let validUrl = urlValue;

        // Add protocol if missing
        if (!urlValue.startsWith('http://') && !urlValue.startsWith('https://')) {
          validUrl = 'https://' + urlValue;
        }

        // Validate URL format
        const urlObj = new URL(validUrl);

        // Check if it's a reasonable URL
        if (!urlObj.hostname || urlObj.hostname.length < 3) {
          throw new Error("Invalid hostname");
        }

        // Auto-detect API version from URL
        const detectedApiVersion = detectApiVersion(validUrl);

        // Test endpoint before saving (only for new endpoints)
        if (!editingId) {
          $("#deeplxApiResponse").textContent = "Testing endpoint before adding...";
          $("#deeplxApiResponse").style.color = "blue";

          const testService = {
            url: validUrl,
            token: tokenValue,
            apiVersion: detectedApiVersion
          };

          try {
            const testResult = await new Promise((resolve) => {
              chrome.runtime.sendMessage({
                action: "testDeepLXEndpoint",
                service: testService
              }, resolve);
            });

            if (!testResult.success) {
              $("#deeplxApiResponse").textContent = `✗ Endpoint test failed: ${testResult.error || testResult.message}. Please check your URL and token.`;
              $("#deeplxApiResponse").style.color = "red";
              return; // Don't save if test fails
            }

            $("#deeplxApiResponse").textContent = "✓ Endpoint test successful! Adding endpoint...";
            $("#deeplxApiResponse").style.color = "green";
          } catch (error) {
            $("#deeplxApiResponse").textContent = `✗ Test failed: ${error.message || "Unknown error"}. Please check your URL and token.`;
            $("#deeplxApiResponse").style.color = "red";
            return; // Don't save if test fails
          }
        }

        if (editingId) {
          // Update existing service
          const serviceIndex = deeplxConfig.services.findIndex(s => s.id === editingId);
          if (serviceIndex !== -1) {
            // Check if URL+Token combination conflicts with other services (excluding current one)
            const existingService = deeplxConfig.services.find(s =>
              s.url === validUrl &&
              s.token === tokenValue &&
              s.id !== editingId
            );
            if (existingService) {
              alert("This URL and token combination is already configured for another endpoint");
              return;
            }

            // Test endpoint before updating
            $("#deeplxApiResponse").textContent = "Testing endpoint before updating...";
            $("#deeplxApiResponse").style.color = "blue";

            const testService = {
              url: validUrl,
              token: tokenValue,
              apiVersion: detectedApiVersion
            };

            try {
              const testResult = await new Promise((resolve) => {
                chrome.runtime.sendMessage({
                  action: "testDeepLXEndpoint",
                  service: testService
                }, resolve);
              });

              if (!testResult.success) {
                $("#deeplxApiResponse").textContent = `✗ Endpoint test failed: ${testResult.error || testResult.message}. Please check your URL and token.`;
                $("#deeplxApiResponse").style.color = "red";
                return; // Don't save if test fails
              }

              $("#deeplxApiResponse").textContent = "✓ Endpoint test successful! Updating endpoint...";
              $("#deeplxApiResponse").style.color = "green";
            } catch (error) {
              $("#deeplxApiResponse").textContent = `✗ Test failed: ${error.message || "Unknown error"}. Please check your URL and token.`;
              $("#deeplxApiResponse").style.color = "red";
              return; // Don't save if test fails
            }

            // Update service and clear all error states since test was successful
            deeplxConfig.services[serviceIndex] = {
              ...deeplxConfig.services[serviceIndex],
              url: validUrl,
              token: tokenValue,
              apiVersion: detectedApiVersion,
              weight: weight,
              lastTestStatus: 'success', // Mark as tested successfully
              lastTestTime: Date.now()
            };

            // Clear all error states on successful test
            delete deeplxConfig.services[serviceIndex].lastTestError;
            delete deeplxConfig.services[serviceIndex].permanentError;
            delete deeplxConfig.services[serviceIndex].permanentErrorReason;

            saveDeepLXConfig();

            // Clear form and reset button
            resetEditForm();

            // Show success message
            $("#deeplxApiResponse").textContent = `Endpoint updated successfully! (${detectedApiVersion.charAt(0).toUpperCase() + detectedApiVersion.slice(1)} API)`;
            $("#deeplxApiResponse").style.color = "green";
            clearApiResponseMessage(3000);
          }
        } else {
          // Add new service
          // Check if URL+Token combination already exists
          const existingService = deeplxConfig.services.find(s =>
            s.url === validUrl && s.token === tokenValue
          );
          if (existingService) {
            alert("This URL and token combination is already configured");
            return;
          }

          // Create new service
          const newService = {
            id: generateServiceId(),
            url: validUrl,
            token: tokenValue,
            apiVersion: detectedApiVersion,
            weight: weight,
            enabled: true,
            lastTestStatus: 'success', // Mark as tested successfully
            lastTestTime: Date.now()
          };

          deeplxConfig.services.push(newService);
          saveDeepLXConfig();

          // Clear form
          $("#deeplxURL").value = "";
          $("#deeplxTOKEN").value = "";
          $("#deeplxWeight").value = "1";

          // Show success message
          $("#deeplxApiResponse").textContent = `Endpoint added successfully! (${detectedApiVersion.charAt(0).toUpperCase() + detectedApiVersion.slice(1)} API)`;
          $("#deeplxApiResponse").style.color = "green";
          clearApiResponseMessage(3000);
        }

        // Trigger service selector update
        $("#btnEnableGoogle").dispatchEvent(new Event('input'));

      } catch (e) {
        $("#deeplxApiResponse").textContent = `Error: ${e.message || "Invalid URL format"}. Please provide a valid URL like: https://api.deeplx.org/translate`;
        $("#deeplxApiResponse").style.color = "red";
      }
    };

    // Cancel edit functionality
    $("#cancelEditDeepLX").onclick = () => {
      resetEditForm();
    };

    // Test endpoint functionality
    $("#testDeepLXService").onclick = async () => {
      const urlValue = $("#deeplxURL").value.trim();
      const tokenValue = $("#deeplxTOKEN").value.trim();

      if (!urlValue) {
        alert("Please provide a URL to test");
        return;
      }

      try {
        let validUrl = urlValue;
        if (!urlValue.startsWith('http://') && !urlValue.startsWith('https://')) {
          validUrl = 'https://' + urlValue;
        }

        $("#deeplxApiResponse").textContent = "Testing endpoint...";
        $("#deeplxApiResponse").style.color = "blue";

        // Auto-detect API version for testing
        const detectedApiVersion = detectApiVersion(validUrl);

        // Simple test request
        const testResult = await testDeepLXEndpoint(validUrl, tokenValue, detectedApiVersion);

        if (testResult.success) {
          $("#deeplxApiResponse").textContent = `✓ Endpoint test successful! Response: ${testResult.message}`;
          $("#deeplxApiResponse").style.color = "green";
          clearApiResponseMessage(3000);
        } else {
          $("#deeplxApiResponse").textContent = `✗ Endpoint test failed: ${testResult.message}`;
          $("#deeplxApiResponse").style.color = "red";
          clearApiResponseMessage(5000);
        }

      } catch (e) {
        $("#deeplxApiResponse").textContent = `✗ Test failed: ${e.message}`;
        $("#deeplxApiResponse").style.color = "red";
        clearApiResponseMessage(5000);
      }
    };

    // Test DeepLX endpoint using background script
    const testDeepLXEndpoint = async (url, token, apiVersion) => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({
          action: "testDeepLXEndpoint",
          service: {
            url: url,
            token: token,
            apiVersion: apiVersion
          }
        }, resolve);
      });
    };



    // Load balance strategy change
    $("#deeplxLoadBalanceStrategy").onchange = (e) => {
      deeplxConfig.loadBalanceStrategy = e.target.value;
      saveDeepLXConfig();
    };

    // Remove all endpoints
    $("#removeAllDeepLX").onclick = () => {
      if (confirm("Are you sure you want to remove all DeepLX endpoints?")) {
        deeplxConfig.services = [];
        saveDeepLXConfig();

        // Reset service selection if needed
        if (twpConfig.get("textTranslatorService") === "deeplx") {
          twpConfig.set("textTranslatorService", twpConfig.get("pageTranslatorService"));
        }
        if (twpConfig.get("pageTranslatorService") === "deeplx") {
          twpConfig.set("pageTranslatorService", "google");
        }
      }
    };

    // Update DeepLX checkbox based on endpoint availability
    const updateDeepLXCheckbox = () => {
      const hasServices = deeplxConfig.services.length > 0;
      $("#btnEnableDeepLX").checked = hasServices;
      $("#btnEnableDeepLX").disabled = !hasServices;
    };

    // Test specific endpoint
    const testSpecificEndpoint = async (serviceId) => {
      const service = deeplxConfig.services.find(s => s.id === serviceId);
      if (!service) return;

      // Find the button and status indicator
      const testButton = document.querySelector(`button[data-action="test"][data-service-id="${serviceId}"]`);
      const statusIndicator = document.querySelector(`#test-status-${serviceId}`);

      if (testButton) {
        testButton.textContent = "Testing...";
        testButton.disabled = true;
      }

      if (statusIndicator) {
        statusIndicator.style.display = "inline";
        statusIndicator.textContent = "🔄 Testing...";
        statusIndicator.style.color = "#007bff";
      }

      try {
        const result = await new Promise((resolve) => {
          chrome.runtime.sendMessage({
            action: "testDeepLXEndpoint",
            service: service
          }, resolve);
        });

        // Update service test status in config
        const serviceIndex = deeplxConfig.services.findIndex(s => s.id === serviceId);
        if (serviceIndex !== -1) {
          if (result.success) {
            // Clear all error states on successful test
            deeplxConfig.services[serviceIndex].lastTestStatus = 'success';
            deeplxConfig.services[serviceIndex].lastTestTime = Date.now();
            delete deeplxConfig.services[serviceIndex].lastTestError;
            delete deeplxConfig.services[serviceIndex].permanentError;
            delete deeplxConfig.services[serviceIndex].permanentErrorReason;
          } else {
            // Set error states on failed test
            deeplxConfig.services[serviceIndex].lastTestStatus = 'failed';
            deeplxConfig.services[serviceIndex].lastTestTime = Date.now();
            deeplxConfig.services[serviceIndex].lastTestError = result.error || result.message;

            // Check if it's a permanent error (401, 403, etc.)
            if (result.status) {
              const permanentErrors = [401, 403, 404, 429]; // Unauthorized, Forbidden, Not Found, Rate Limited
              if (permanentErrors.includes(result.status)) {
                deeplxConfig.services[serviceIndex].permanentError = true;
                deeplxConfig.services[serviceIndex].permanentErrorReason = `HTTP ${result.status}`;
              }
            }
          }

          // Save the updated config (but don't trigger service update)
          const customServices = twpConfig.get("customServices");
          const index = customServices.findIndex(cs => cs.name === "deeplx");
          if (index !== -1) {
            customServices[index] = deeplxConfig;
            twpConfig.set("customServices", customServices);
          }
        }

        if (result.success) {
          if (testButton) {
            testButton.textContent = "✓ Success";
            testButton.style.backgroundColor = "#28a745";
            testButton.style.color = "white";
          }
          if (statusIndicator) {
            statusIndicator.textContent = "✅ Connected";
            statusIndicator.style.color = "#28a745";
          }

          setTimeout(() => {
            if (testButton) {
              testButton.textContent = "Test";
              testButton.style.backgroundColor = "";
              testButton.style.color = "";
              testButton.disabled = false;
            }
            if (statusIndicator) {
              statusIndicator.style.display = "none";
            }
            // Refresh the services list to show updated status
            updateDeepLXServicesList();
          }, 3000);
        } else {
          // Check if it's a permanent error for display
          const isPermanentError = result.status && [401, 403, 404, 429].includes(result.status);
          const errorIcon = isPermanentError ? "🚫" : "❌";
          const errorPrefix = isPermanentError ? "PERMANENT" : "Failed";

          if (testButton) {
            testButton.textContent = `✗ ${errorPrefix}`;
            testButton.style.backgroundColor = isPermanentError ? "#6f42c1" : "#dc3545";
            testButton.style.color = "white";
            testButton.title = result.error || "Test failed";
          }
          if (statusIndicator) {
            statusIndicator.textContent = `${errorIcon} ${result.message || 'Failed'}`;
            statusIndicator.style.color = isPermanentError ? "#6f42c1" : "#dc3545";
            statusIndicator.title = result.error || "Test failed";
          }

          setTimeout(() => {
            if (testButton) {
              testButton.textContent = "Test";
              testButton.style.backgroundColor = "";
              testButton.style.color = "";
              testButton.title = "";
              testButton.disabled = false;
            }
            if (statusIndicator) {
              statusIndicator.style.display = "none";
              statusIndicator.title = "";
            }
            // Refresh the services list to show updated status
            updateDeepLXServicesList();
          }, 5000);
        }
      } catch (error) {
        if (testButton) {
          testButton.textContent = "✗ Error";
          testButton.style.backgroundColor = "#dc3545";
          testButton.style.color = "white";
          testButton.title = error.message || "Test error";
        }
        if (statusIndicator) {
          statusIndicator.textContent = "❌ Error";
          statusIndicator.style.color = "#dc3545";
          statusIndicator.title = error.message || "Test error";
        }

        setTimeout(() => {
          if (testButton) {
            testButton.textContent = "Test";
            testButton.style.backgroundColor = "";
            testButton.style.color = "";
            testButton.title = "";
            testButton.disabled = false;
          }
          if (statusIndicator) {
            statusIndicator.style.display = "none";
            statusIndicator.title = "";
          }
        }, 5000);
      }
    };

    // Add one-time event delegation for service buttons
    const container = $("#deeplxServicesContainer");
    container.addEventListener('click', (e) => {
      const button = e.target.closest('button[data-action]');
      if (!button) return;

      const action = button.getAttribute('data-action');
      const serviceId = button.getAttribute('data-service-id');

      if (action === 'test') {
        testSpecificEndpoint(serviceId);
      } else if (action === 'edit') {
        editDeepLXService(serviceId);
      } else if (action === 'toggle') {
        toggleDeepLXService(serviceId);
      } else if (action === 'remove') {
        removeDeepLXService(serviceId);
      }
    });

    // Initialize DeepLX configuration
    loadDeepLXConfig();
    $("#deeplxLoadBalanceStrategy").value = deeplxConfig.loadBalanceStrategy;
    updateDeepLXServicesList();
    updateDeepLXCheckbox();
    updateLoadBalanceVisibility();



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
