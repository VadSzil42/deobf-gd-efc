(async function () {
  const vLN4 = 4;
  const vLN3 = 3;
  const vLN1 = 1;
  const v12 = new Set([]);
  const vLS6dZuyhWp39Xry9Y6N8La = "6dZuyh/Wp39Xry9Y6N8LacQrWTP3fQ7aP9kHFVxztgc=";
  const vO = {};
  const v13 = new Set(["application/vnd.google-apps.folder", "application/vnd.google-apps.shortcut"]);
  const vLSpThisCouldBeBecauseO = "<p>This could be because of \"mixed content\". The page you're on is served over HTTPS and tries to connect to another page that's served over HTTP - and your browser doesn't like that.</p><p>If you're on <b>Chrome</b> - click on the padlock icon, \"Site settings\", scroll to the bottom of the page and set \"Insecure content\" to \"Allow\"</p><p class=\"text-center\"><img src=\"images/chrome1.png\"></p><p class=\"text-center\"><img src=\"images/chrome2.png\"></p><p>If you're on <b>Firefox</b> - click on the padlock icon, click that arrow next to the \"Firefox has blocked...\" message and then on \"Disable protection for now\".</p><p class=\"text-center\"><img src=\"images/firefox1.png\"></p><p class=\"text-center\"><img src=\"images/firefox2.png\"></p>";
  class C extends Error {}
  class C2 {
    static async authenticate(p5, p6) {
      const v14 = new C2();
      if (p6) {
        v14.token = p5;
      }
      await v14.getTokens(p5, p6);
      await v14.getUserInfo();
      v14.teamDrive = false;
      return v14;
    }
    get free() {
      if (this.teamDrive) {
        return Infinity;
      } else {
        return this.limit - this.usage;
      }
    }
    async serverRequest(p7, p8, p9) {
      let vUndefined = undefined;
      let vO2 = {};
      do {
        let v15 = await this._serverRequest(p7, p8, p9, vUndefined);
        if (Array.isArray(v15)) {
          return v15;
        }
        for (const [v16, v17] of Object.entries(v15)) {
          if (typeof vO2[v16] === "undefined" || !Array.isArray(v17)) {
            vO2[v16] = v17;
          } else {
            vO2[v16] = vO2[v16].concat(v17);
          }
        }
        if (typeof v15.nextPageToken === "undefined") {
          break;
        } else {
          vUndefined = v15.nextPageToken;
        }
      } while (true);
      delete vO2.nextPageToken;
      return vO2;
    }
    async _serverRequest(p10, p11, p12, p13, p14) {
      await this.renewToken();
      const vO3 = {
        auth: this.accessToken
      };
      let v18;
      if (typeof p12 === "undefined") {
        vO3.folder = p11;
        v18 = "/info";
        if (typeof p13 !== "undefined") {
          vO3.pageToken = p13;
        }
      } else {
        vO3.files = p12;
        vO3.destination = this.folder;
        v18 = "/clone";
      }
      const v19 = await fetch(p10 + v18, {
        method: "POST",
        body: JSON.stringify(vO3)
      });
      const v20 = await v19.text();
      let v21;
      try {
        v21 = JSON.parse(v20);
      } catch (e2) {
        throw Error(v20);
      }
      const v22 = v21.version || 1;
      if (v22 !== vLN4) {
        const v23 = v22 > vLN4 ? "runs this site" : "shared encrypted ID";
        throw new C("Decryption server is running version " + v22 + " of the code, this page works with version " + vLN4 + ". Contact the person who " + v23 + " and tell them to update the code.");
      }
      if (v21.status === "ok") {
        if (typeof v21.data.error !== "undefined") {
          if (typeof p14 === "undefined" && f2(v21.data.error.message)) {
            await f(3);
            return this._serverRequest(p10, p11, p12, p13, true);
          }
          throw Error(v21.data.error.message);
        }
        return v21.data;
      } else if (v21.status === "error") {
        if (typeof p14 === "undefined" && f2(v21.reason)) {
          await f(3);
          return this._serverRequest(p10, p11, p12, p13, true);
        }
        throw new C(v21.reason);
      } else {
        throw Error(v20);
      }
    }
    async cloneFile(p15) {
      return this.apiRequest("files/" + p15 + "/copy?supportsAllDrives=true&fields=id,size,name,webViewLink", {
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          parents: [this.folder],
          appProperties: {
            createdWithDdEfc: 1
          }
        })
      });
    }
    async getFolder(p16) {
      const v24 = await this.apiRequest("files/" + p16 + "?supportsAllDrives=true&fields=name,mimeType,shortcutDetails/*");
      let v25;
      if (v24.mimeType === "application/vnd.google-apps.folder") {
        v25 = await this.apiRequest("files?q=\"" + p16 + "\"+in+parents&fields=nextPageToken,files(id,webViewLink,size,name,mimeType,md5Checksum,shortcutDetails/*)&orderBy=name_natural&supportsAllDrives=true&includeItemsFromAllDrives=true&pageSize=1000");
      } else if (v24.mimeType === "application/vnd.google-apps.shortcut") {
        v25 = {
          files: [{
            notLoaded: true,
            id: v24.shortcutDetails.targetId,
            mimeType: v24.shortcutDetails.targetMimeType,
            name: v24.name
          }]
        };
        delete v24.shortcutDetails;
      } else {
        v25 = {
          files: [{
            notLoaded: true,
            id: p16,
            mimeType: v24.mimeType,
            name: v24.name
          }]
        };
      }
      delete v24.mimeType;
      const vA2 = [];
      for (const v26 of v25.files) {
        if (v26.mimeType === "application/vnd.google-apps.shortcut") {
          v26.notLoaded = true;
          v26.id = v26.shortcutDetails.targetId;
          v26.mimeType = v26.shortcutDetails.targetMimeType;
        }
        let v27;
        if (v26.notLoaded === true) {
          if (v26.mimeType === "application/vnd.google-apps.folder") {
            continue;
          }
          v27 = await this.apiRequest("files/" + v26.id + "?supportsAllDrives=true&fields=webViewLink,size,md5Checksum");
          v27.id = v26.id;
          v27.mimeType = v26.mimeType;
          v27.name = v26.name;
        } else {
          v27 = v26;
        }
        vA2.push(v27);
      }
      v25.files = vA2;
      return Object.assign(v25, v24);
    }
    async getMyFolder() {
      const v28 = await this.apiRequest("files/" + this.folder + "?supportsAllDrives=true&fields=parents,name,driveId,capabilities/canAddChildren,capabilities/canRemoveChildren,capabilities/canDeleteChildren,capabilities/canTrashChildren");
      if (!v28.capabilities.canAddChildren) {
        throw Error("Not a folder or can't create new files there.");
      }
      this.teamDrive = typeof v28.driveId !== "undefined";
      if (this.teamDrive) {
        v28.canDelete = v28.capabilities.canDeleteChildren;
        v28.canTrash = v28.capabilities.canTrashChildren;
        const v29 = await this.apiRequest("drives/" + v28.driveId + "?fields=name,restrictions/domainUsersOnly,restrictions/driveMembersOnly");
        v28.canShare = !v29.restrictions.domainUsersOnly && !v29.restrictions.driveMembersOnly;
        if (this.folder === v28.driveId) {
          v28.name = v29.name;
        }
      } else {
        await this.getUserInfo();
        v28.canDelete = v28.capabilities.canRemoveChildren;
        v28.canShare = true;
        v28.canTrash = true;
      }
      const v30 = await this.apiRequest("files?q=\"" + this.folder + "\"+in+parents+and+(+mimeType+%3D+'application%2Fvnd.google-apps.folder'+or+(+mimeType+!%3D+'application%2Fvnd.google-apps.shortcut'+and+appProperties+has+%7B+key%3D'createdWithDdEfc'+and+value%3D'1'+%7D+)+)&fields=nextPageToken,files(id,webViewLink,permissionIds,size,name,mimeType,trashed)&orderBy=name_natural&supportsAllDrives=true&includeItemsFromAllDrives=true&pageSize=1000");
      return Object.assign(v30, v28);
    }
    async shareFile(p17) {
      return await this.apiRequest("files/" + p17 + "/permissions?supportsAllDrives=true", {
        method: "POST",
        body: "{\"role\":\"reader\",\"type\":\"anyone\"}",
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    async trashFile(p18) {
      return await this.apiRequest("files/" + p18 + "?supportsAllDrives=true", {
        method: "PATCH",
        body: "{\"trashed\":\"true\"}",
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    async deleteFile(p19) {
      return await this.apiRequest("files/" + p19 + "?supportsAllDrives=true", {
        method: "DELETE"
      });
    }
    async getTokens(p20, p21) {
      const v31 = new URLSearchParams({
        client_id: vV138,
        client_secret: vV139
      });
      if (p21 === true) {
        v31.set("refresh_token", p20);
        v31.set("grant_type", "refresh_token");
      } else {
        v31.set("code", p20);
        v31.set("grant_type", "authorization_code");
        v31.set("redirect_uri", vLSHttp12700153683);
      }
      const v32 = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        body: v31.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      if (v32.ok) {
        const v33 = await v32.json();
        this.accessToken = v33.access_token;
        this.expires = new Date();
        this.expires.setSeconds(this.expires.getSeconds() + v33.expires_in - 60);
        if (!p21) {
          this.token = v33.refresh_token;
        }
      } else {
        throw Error(await v32.text());
      }
    }
    async renewToken() {
      if (new Date() > this.expires) {
        await this.getTokens(this.token, true);
      }
    }
    async apiRequest(p22, p23) {
      let vP22 = p22;
      const vO4 = {};
      do {
        let v34 = await this._apiRequest(vP22, p23);
        if (v34 === "NO_RESPONSE") {
          return;
        }
        for (const [v35, v36] of Object.entries(v34)) {
          if (typeof vO4[v35] === "undefined" || !Array.isArray(v36)) {
            vO4[v35] = v36;
          } else {
            vO4[v35] = vO4[v35].concat(v36);
          }
        }
        if (typeof v34.nextPageToken === "undefined") {
          break;
        } else {
          vP22 = p22 + "&pageToken=" + v34.nextPageToken;
        }
      } while (true);
      delete vO4.nextPageToken;
      return vO4;
    }
    async _apiRequest(p24, p25, p26) {
      await this.renewToken();
      const v37 = p25 || {};
      v37.headers = v37.headers || {};
      v37.headers.Authorization = v37.headers.Authorization || "Bearer " + this.accessToken;
      v37.headers.Accept = v37.headers.Accept || "application/json";
      const v38 = await fetch("https://www.googleapis.com/drive/v3/" + p24, v37);
      if (v38.ok && v37.method === "DELETE") {
        return "NO_RESPONSE";
      }
      const v39 = await v38.text();
      let v40;
      try {
        v40 = JSON.parse(v39);
      } catch (e3) {
        throw Error(v39);
      }
      if (typeof v40.error !== "undefined") {
        if (typeof p26 === "undefined" && f2(v40.error.message)) {
          await f(3);
          return this._apiRequest(p24, p25, true);
        }
        throw Error(v40.error.message);
      }
      return v40;
    }
    async getUserInfo() {
      const v41 = await this.apiRequest("about?fields=user%2FdisplayName%2Cuser%2FemailAddress%2CstorageQuota%2Flimit%2CstorageQuota%2Fusage");
      this.usage = typeof v41.storageQuota.usage === "undefined" ? 0 : Number(v41.storageQuota.usage);
      this.limit = typeof v41.storageQuota.limit === "undefined" ? Infinity : Number(v41.storageQuota.limit);
      this.name = v41.user.displayName;
      this.email = v41.user.emailAddress;
    }
    static async revokeToken(p27) {
      const v42 = await fetch("https://oauth2.googleapis.com/revoke?token=" + encodeURIComponent(p27), {
        method: "POST"
      });
      const v43 = await v42.text();
      let v44;
      try {
        v44 = JSON.parse(v43);
      } catch (e4) {
        throw Error(v43);
      }
      if (typeof v44.error !== "undefined") {
        if (v44.error === "invalid_token") {} else {
          throw Error(v43);
        }
      }
    }
  }
  class C3 {
    constructor(p28, p29, p30) {
      const vA3 = ["#collapse_files_" + p29];
      if (typeof p30 !== "undefined") {
        vA3.push(p30);
      }
      p28.html($("#templates .file_list").html());
      this.self = p28;
      this.name = p29;
      this.self.find(".collapse").attr("id", "collapse_files_" + p29).end().find("thead").find("label").attr("for", "check_all_" + p29).end().find("input[type=checkbox]").attr("id", "check_all_" + p29).change(p31 => {
        this.getCheckboxes().prop("checked", p31.target.checked);
      });
      this.clear();
      this.onFolderClick = null;
    }
    clearCheckAll() {
      this.self.find("thead input[type=checkbox]").prop("checked", false);
    }
    clear() {
      this.folders = 0;
      this.count = 0;
      this.size = 0;
      this.files = {};
      this.self.find(".file_row, .folder_row").remove();
      this.clearCheckAll();
    }
    removeHeader() {
      this.self.find(".details_container, thead").remove();
    }
    manage_details() {
      if (this.folders > 0 || this.count > 0) {
        this.self.find("table").show();
      } else {
        this.self.find("table").hide();
      }
    }
    get folders() {
      return this._folders;
    }
    set folders(p32) {
      this._folders = p32;
      this.manage_details();
    }
    get count() {
      return this._count;
    }
    set count(p33) {
      this._count = p33;
      this.self.find(".details_container .files_count").text(p33);
      this.manage_details();
    }
    get size() {
      return this._size;
    }
    set size(p34) {
      this._size = p34;
      this.self.find(".details_container .files_size").text(f4(p34));
    }
    get title() {
      return this._title;
    }
    set title(p35) {
      this._title = p35;
      this.self.find(".title_container h4").text(p35);
    }
    getCheckboxes() {
      return this.self.find(".file_row input[type=checkbox]");
    }
    getCheckedCheckboxes() {
      return this.getCheckboxes().filter(":checked");
    }
    getFiles(p36) {
      const vA4 = [];
      p36.each((p37, p38) => {
        vA4.push(this.files[$(p38).data("id")].data);
      });
      return vA4;
    }
    uncheckFiles(p39) {
      for (const v45 of p39) {
        this.files[v45].element.find("input[type=checkbox]").prop("checked", false);
      }
      this.clearCheckAll();
    }
    addButton(p40, p41, p42, p43) {
      const v46 = $("#templates .file_button").clone();
      const v47 = v46.find("button").text(p41);
      if (typeof p43 !== "undefined") {
        for (const v48 of p43) {
          v47.addClass(v48);
        }
      }
      if (p40 === "title") {
        this.self.find(".title_container").append(v46);
        v47.click(p44 => {
          p44.preventDefault();
          p42(this.getFiles(this.getCheckboxes()), p44);
        });
      } else {
        this.self.find(".details_container").append(v46);
        v47.click(p45 => {
          p45.preventDefault();
          p42(this.getFiles(this.getCheckedCheckboxes()), p45);
        });
      }
    }
    addFolder(p46) {
      const v49 = $("#templates .folder_row").clone().find("td").append($("<a>").attr("href", "#").data("id", p46.id).click(this.onFolderClick).text(p46.name)).end();
      this.folders += 1;
      const v50 = this.self.find(".files");
      const v51 = v50.find(".folder_row:last");
      if (v51.length === 1) {
        v51.after(v49);
      } else {
        v50.prepend(v49);
      }
    }
    addFile(p47) {
      if (p47.mimeType === "application/vnd.google-apps.folder") {
        this.addFolder(p47);
        return;
      }
      if (v13.has(p47.mimeType)) {
        return;
      }
      const v52 = p47.id;
      if (typeof this.files[v52] !== "undefined") {
        return;
      }
      const vNumber = Number(p47.size);
      const v53 = $("#templates .file_row").clone().find("input[type=checkbox]").attr("id", v52).data("id", v52).end().find(".filename").attr("for", v52).text(p47.name + " ").end().find(".filesize").text(f4(vNumber)).end();
      if (typeof p47.webViewLink !== "undefined") {
        v53.find(".filename").append($("<a>Download</a>").attr("href", p47.webViewLink));
      }
      this.files[v52] = {
        data: p47,
        element: v53
      };
      this.count += 1;
      this.size += vNumber;
      this.self.find(".files").append(v53);
    }
    removeFile(p48) {
      try {
        const v_0x32aa33 = f3(p48);
        this.files[v_0x32aa33].element.remove();
        delete this.files[v_0x32aa33];
      } catch (e5) {}
    }
  }
  async function f(p49) {
    return new Promise(p50 => {
      window.setTimeout(p50, p49 * 1000);
    });
  }
  function f2(p51) {
    return p51.includes("Rate limit exceeded") || p51.includes("Quota exceeded for quota metric");
  }
  function f3(p52) {
    if (typeof p52.id !== "undefined") {
      return p52.id;
    } else {
      return [p52.originalFilename, p52.size, p52.md5Checksum].join("*");
    }
  }
  const vA5 = ["B", "KB", "MB", "GB", "TB"];
  function f4(p53) {
    if (p53 === 0) {
      return "0B";
    }
    const v54 = Math.min(Math.floor(Math.log2(p53) / 10), 4);
    const v55 = p53 / Math.pow(1024, v54);
    return "" + Number(v55.toFixed(2)) + vA5[v54];
  }
  function f5(p54, p55) {
    const v56 = new Blob([p55], {
      type: "octet/stream"
    });
    const v57 = document.createElement("a");
    const v58 = window.URL.createObjectURL(v56);
    v57.href = v58;
    v57.download = p54;
    v57.style = "display: none";
    document.body.appendChild(v57);
    v57.click();
    window.URL.revokeObjectURL(v58);
    v57.remove();
  }
  function f6(p56, p57) {
    return p56.charCodeAt(p57 % p56.length);
  }
  function f7(p58, p59) {
    const v59 = new Uint8Array(p58.length);
    for (let vLN02 = 0; vLN02 < p58.length; ++vLN02) {
      v59[vLN02] = p58[vLN02] ^ f6(p59, vLN02);
    }
    return v59;
  }
  function f8(p60, p61) {
    const v60 = new TextEncoder();
    return b64.bytesToBase64(f7(v60.encode(p60), p61));
  }
  function f9(p62, p63) {
    const v61 = new TextDecoder();
    return v61.decode(f7(b64.base64ToBytes(p62), p63));
  }
  function f10(p64) {
    localStorage.removeItem(p64);
  }
  function f11(p65) {
    const v62 = localStorage.getItem(p65);
    let vO5 = {};
    if (v62 !== null) {
      try {
        vO5 = JSON.parse(f9(v62, vLS6dZuyhWp39Xry9Y6N8La));
      } catch (e6) {}
    }
    return vO5;
  }
  function f12(p66, p67) {
    localStorage.setItem(p66, f8(JSON.stringify(p67), vLS6dZuyhWp39Xry9Y6N8La));
  }
  function f13() {
    return f11("accounts");
  }
  function f14(p68) {
    f12("accounts", p68);
  }
  function f15() {
    return f11("serverCache");
  }
  function f16(p69) {
    f12("serverCache", p69);
  }
  const v$ = $("#error_modal");
  function f17(p70, p71, p72, p73) {
    if (p73 === true) {
      v$.find(".modal-dialog").addClass("modal-lg");
    } else {
      v$.find(".modal-dialog").removeClass("modal-lg");
    }
    v$.find(".modal-title").text(p70).parent().removeClass("alert-danger alert-success alert-primary").addClass(p72);
    v$.find(".modal-body").html(p71);
    v$.data("bs.modal", null).modal();
  }
  function f18(p74, p75) {
    console.error(p74);
    if (p74.includes("User rate limit exceeded")) {
      p74 = "Too many people have tried to download these files. Try again tomorrow.<br>This is a Google limit, there's no way to bypass it.";
    } else if (f2(p74)) {
      p74 = "Too many people use this tool at the moment. Try again in a minute.";
    }
    f17("Error", p74, "alert-danger", p75);
  }
  function f19(p76, p77) {
    f17(p76, p77, "alert-success");
  }
  const v$2 = $("#loading_modal");
  function f20() {
    v$2.unbind("shown.bs.modal").on("hidden.bs.modal", () => {
      v$2.unbind("hidden.bs.modal").modal("show");
    }).modal("show");
  }
  function f21() {
    v$2.unbind("hidden.bs.modal").on("shown.bs.modal", () => {
      v$2.unbind("shown.bs.modal").modal("hide");
    }).modal("hide");
  }
  function f22(p78) {
    const v63 = $(p78).closest("[data-account-type]").data("account-type");
    if (v63 !== "main" && v63 !== "dummy") {
      throw Error("Unknown account type");
    }
    return v63;
  }
  function f23() {
    const vF13 = f13();
    const v$3 = $("#templates .account_row");
    const v$4 = $("#account_list");
    const v64 = v$4.find("tbody");
    const vA6 = [];
    for (const v65 of Object.values(vO)) {
      vA6.push(v65.email);
    }
    let v66 = true;
    for (const v67 of Object.keys(vF13)) {
      if (vA6.includes(v67)) {
        continue;
      }
      const v68 = vF13[v67];
      const v69 = v67 !== "unknown" ? v68.name : "unknown";
      const v70 = v$3.clone();
      v70.data("email", v67).data("token", v68.token).find("td:first-child").html("<b>" + v69 + "</b> (" + v67 + ")");
      v64.append(v70);
      v66 = false;
    }
    if (!v66) {
      v$4.show();
    }
    if (Object.keys(vF13).length > 0) {
      $("#custom_oauth").attr("disabled", "disabled");
      $("#custom_oauth_info1").hide();
      $("#custom_oauth_info2").show();
      $("#custom_oauth_rows2").hide();
    } else {
      $("#custom_oauth").removeAttr("disabled");
      $("#custom_oauth_info1").show();
      $("#custom_oauth_info2").hide();
      $("#custom_oauth_rows2").show();
    }
    const vF11 = f11("oauth");
    if (typeof vF11.id !== "undefined" && typeof vF11.secret !== "undefined") {
      if (!$("#custom_oauth").prop("checked")) {
        $("#custom_oauth").removeAttr("disabled");
        $("#custom_oauth").click();
      }
      $("#custom_oauth").attr("disabled", "disabled");
      vV138 = vF11.id;
      vV139 = vF11.secret;
      $("#client_id").val(vV138);
      $("#client_secret").val(vV139);
    } else {
      if ($("#custom_oauth").prop("checked")) {
        $("#custom_oauth").click();
      }
      vV138 = v138;
      vV139 = v139;
      $("#client_id").val("");
      $("#client_secret").val("");
    }
  }
  function f24() {
    for (const v71 of Object.keys(vO)) {
      const v72 = vO[v71];
      const v73 = v72.free;
      $("[data-account-type=\"" + v71 + "\"]").find(".user_name").html("<b>" + v72.name + "</b> (" + v72.email + ")").end().find(".free_space").html("Free: <b>" + (v73 === Infinity ? "unlimited" : f4(v73)) + "</b>");
    }
  }
  async function f25(p79, p80, p81) {
    const vF132 = f13();
    const v74 = typeof p81 !== "undefined";
    let v75;
    f20();
    try {
      v75 = await C2.authenticate(p80, v74);
    } catch (e7) {
      f21();
      f18(e7.message);
      return;
    }
    f21();
    vO[p79] = v75;
    if (v74) {
      const v76 = vF132[p81];
      v75.dummy = v76.dummy || false;
      v75.folder = v76.folder || "root";
      if (v75.email !== p81) {
        delete vF132[p81];
      }
    } else {
      v75.dummy = false;
      v75.folder = "root";
      const v77 = vF132[v75.email];
      if (typeof v77 !== "undefined" && v77.token !== v75.token) {
        C2.revokeToken(v77.token);
      }
    }
    vF132[v75.email] = Object.assign(vF132[v75.email] || {}, {
      name: v75.name,
      token: v75.token,
      dummy: v75.dummy,
      folder: v75.folder
    });
    f14(vF132);
    f24();
    $("#account_selection").modal("hide");
    $("[data-account-type=\"" + p79 + "\"]").find(".select_acc").hide().end().find(".acc_info").show();
    if (p79 === "main") {
      if (true) {
        f27();
      } else if (v75.dummy) {
        $("[data-account-type=\"dummy\"] .select_acc").hide();
        f27();
      } else if (typeof vO.dummy === "undefined") {
        $("[data-account-type=\"dummy\"] .select_acc").show();
      } else {
        f27();
      }
    } else {
      v75.folder = "root";
      f27();
    }
  }
  async function f26(p82) {
    p82.addClass("loading");
    try {
      await C2.revokeToken(p82.data("token"));
    } catch (e8) {
      p82.removeClass("loading");
      f18(e8.message);
      return;
    }
    p82.removeClass("loading");
    const vF133 = f13();
    delete vF133[p82.data("email")];
    f14(vF133);
    $("#account_list").hide().find(".account_row").remove();
    f23();
  }
  async function f27() {
    await f28();
    $("#my_files").show();
    $("#server_card").show();
    const v78 = document.location.hash.substr(1);
    if (v78.length > 0 && $("#folder_input").val() === "") {
      $("#folder_input").val(v78);
    }
    if ($("#folder_input").val() !== "") {
      $("#folder_load").click();
    }
  }
  async function f28() {
    let v79;
    f20();
    try {
      v79 = await vO.main.getMyFolder();
    } catch (e9) {
      v79 = {
        name: "ERROR",
        canShare: false,
        canTrash: false,
        canDelete: false,
        error: e9
      };
    }
    v140.clear();
    v140.title = v79.name;
    v140.self.find(".share_button").prop("disabled", !v79.canShare).end().find(".trash_button").prop("disabled", !v79.canTrash).end().find(".delete_button").prop("disabled", !v79.canDelete);
    if (v79.canDelete) {
      v140.self.find(".trash_button").parent().hide();
      v140.self.find(".delete_button").parent().show();
    } else {
      v140.self.find(".trash_button").parent().show();
      v140.self.find(".delete_button").parent().hide();
    }
    if (typeof v79.error !== "undefined") {
      f21();
      f18(v79.error.message);
      return;
    }
    f24();
    if (typeof v79.parents !== "undefined") {
      v140.addFolder({
        id: v79.parents[0],
        name: ". ."
      });
    }
    for (const v80 of v79.files) {
      if (!v80.trashed) {
        v140.addFile(v80);
      }
    }
    f21();
  }
  function f29() {
    vO.main.dummy = true;
    $("[data-account-type=\"dummy\"] .select_acc").hide();
    const vF134 = f13();
    vF134[vO.main.email].dummy = true;
    f14(vF134);
    f27();
  }
  function f30(p83) {
    const v$5 = $(p83.target);
    const vF22 = f22(p83.target);
    if (v$5.is("td:first-child")) {
      f25(vF22, v$5.parent().data("token"), v$5.parent().data("email"));
    } else if (v$5.is(".remove-acc")) {
      p83.preventDefault();
      f26(v$5.closest("tr"));
    }
  }
  function f31(p84) {
    p84.preventDefault();
    const v81 = $("#client_id").val().trim();
    const v82 = $("#client_secret").val().trim();
    if (v82 !== "" && v81 != "") {
      f12("oauth", {
        id: v81,
        secret: v82
      });
    }
    f23();
  }
  function f32(p85) {
    p85.preventDefault();
    f10("oauth");
    f23();
  }
  function f33(p86) {
    p86.preventDefault();
    if (localStorage.getItem("warning_shown") === null) {
      alert("Make sure you read the text above the \"Get auth\" button.");
      localStorage.setItem("warning_shown", "");
    }
    const v83 = new URLSearchParams({
      state: new URLSearchParams({
        from: "gd-efc"
      }),
      client_id: vV138,
      redirect_uri: vLSHttp12700153683,
      response_type: "code",
      access_type: "offline",
      approval_prompt: "auto",
      scope: "https://www.googleapis.com/auth/drive"
    });
    window.open("https://accounts.google.com/o/oauth2/auth?" + v83.toString());
  }
  function f34(p87) {
    p87.preventDefault();
    const vF222 = f22(p87.target);
    let v84;
    const v85 = $("#auth_input").val();
    $("#auth_input").val("");
    if (v85 === "") {
      f18("Click \"Get auth\" and copy the redirected URL first!");
      return;
    }
    try {
      const v86 = new URL(v85);
      v84 = decodeURIComponent(v86.searchParams.get("code"));
    } catch (e10) {
      f18(e10.message);
      return;
    }
    f25(vF222, v84);
  }
  function f35(p88) {
    p88.preventDefault();
    const v87 = $("#destination_input").val().trim();
    let v88;
    if (v87 === "" || v87 === "root") {
      v88 = "root";
    } else {
      const v89 = v87.match(/^https:\/\/drive\.google\.com\/(?:open\?id=|drive\/.*?folders\/)([0-9a-zA-Z\-_]+)/);
      if (v89 === null) {
        f18("Bad URL");
        return;
      }
      v88 = v89[1];
    }
    f36(v88);
  }
  async function f36(p89) {
    f20();
    let v90;
    try {
      v90 = await vO.main.apiRequest("files/" + p89 + "?supportsAllDrives=true&fields=capabilities/canAddChildren");
      if (!v90.capabilities.canAddChildren) {
        throw Error("Not a folder or can't create new files there.");
      }
    } catch (e11) {
      f21();
      f18(e11.message);
      return;
    }
    f21();
    const vF135 = f13();
    vF135[vO.main.email].folder = p89;
    f14(vF135);
    vO.main.folder = p89;
    $("#destination_selection").modal("hide");
    $("#destination_input").val("");
    f28();
  }
  async function f37(p90) {
    f20();
    const vA7 = [];
    try {
      for (const v91 of p90) {
        vA7.push(v91.webViewLink);
        if (v91.permissionIds.includes("anyoneWithLink")) {
          continue;
        }
        await vO.main.shareFile(v91.id);
        v91.permissionIds.push("anyoneWithLink");
      }
      f21();
    } catch (e12) {
      f21();
      f18(e12.message);
      return;
    }
    $("#share_links").modal("show").find("textarea").val(vA7.join("\n"));
  }
  async function f38(p91, p92) {
    f20();
    try {
      for (const v92 of p91) {
        await vO.main[p92](v92.id);
        v140.removeFile(v92);
      }
    } catch (e13) {
      f21();
      f18(e13.message);
    }
    f28();
  }
  async function f39(p93) {
    return f38(p93, "trashFile");
  }
  async function f40(p94) {
    return f38(p94, "deleteFile");
  }
  async function f41() {
    let v93;
    try {
      v93 = await f48("Add a new directory", "New directory name:", true);
    } catch (e14) {
      return;
    }
    f20();
    let v94;
    try {
      v94 = await vO.main.apiRequest("files?supportsAllDrives=true&fields=name,id", {
        method: "POST",
        body: JSON.stringify({
          name: v93,
          parents: [vO.main.folder],
          mimeType: "application/vnd.google-apps.folder"
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });
    } catch (e15) {
      f21();
      f18(e15.message);
      return;
    }
    v140.addFolder(v94);
    f28();
  }
  const v95 = new Set(["p", "t", "g", "k", "l"]);
  const vO6 = {
    s: "https://{1}",
    i: "http://{1}",
    p: "https://pastebin.com/raw/{1}",
    t: "https://p.teknik.io/Raw/{1}",
    g: "https://gist.githubusercontent.com/{1}/raw/{2}",
    k: "http://{1}",
    l: "https://{1}"
  };
  function f42(p95, p96) {
    let v96 = vO6[p95];
    if (typeof v96 === "undefined") {
      throw Error("server \"" + p95 + "\" not supported");
    }
    for (let vLN12 = 1;; ++vLN12) {
      const v97 = "{" + vLN12 + "}";
      if (!v96.includes(v97)) {
        break;
      }
      const v98 = p96[vLN12 - 1];
      if (typeof v98 === "undefined") {
        throw Error("missing param for server \"" + p95 + "\": " + p96);
      }
      v96 = v96.replace(v97, v98);
    }
    return v96;
  }
  class C4 {
    constructor() {
      this.initialized = false;
      this.encryptedServers = null;
      this.idType = null;
      this.id = null;
      this.servers = null;
      this.lists = null;
      this.options = null;
      this.knownGoodServer = null;
      this.parents = null;
    }
    init(p97) {
      this.initialized = false;
      this.parents = [];
      const v99 = p97.match(/^https:\/\/drive\.google\.com\/(?:folderview\?id=|open\?id=|drive\/(?:u\/\d+\/)?folders\/|file\/(?:u\/\d+\/)?d\/|uc\?id=)([0-9a-zA-Z\-_]+)/);
      if (v99 !== null) {
        this.idType = "normal";
        this.id = v99[1];
      } else {
        this.idType = "encrypted";
        const v100 = p97.split(".");
        if (v100.length === 2) {
          this.encryptedServers = v100[0];
          this.id = v100[1];
        } else if (v100.length === 1 && encryptedIdPrefix.length > 0) {
          this.encryptedServers = encryptedIdPrefix;
          this.id = v100[0];
        } else {
          throw Error("Invalid encrypted folder ID.");
        }
        this.decodeDecryptServers(this.encryptedServers);
        const vF15 = f15();
        for (const v101 of this.lists) {
          if (typeof vF15[v101] !== "undefined") {
            for (const v102 of vF15[v101]) {
              this.servers.add(v102);
            }
          }
        }
      }
      this.initialized = true;
    }
    changeFolder(p98) {
      if (this.parents.length > 0 && p98 === this.parents[this.parents.length - 1]) {
        this.id = this.parents.pop();
      } else {
        this.parents.push(this.id);
        this.id = p98;
      }
    }
    decodeDecryptServers(p99) {
      this.servers = new Set();
      this.lists = new Set();
      for (const v103 of atob(p99).split(";")) {
        let v104;
        let v105;
        try {
          [, v104, v105] = v103.match(/^(.):(.+)$/);
        } catch (e16) {
          v104 = "s";
          v105 = v103;
        }
        if (v104 === "!") {
          this.parseOptions(v105);
        } else {
          try {
            v105 = f42(v104, v105.split("<"));
          } catch (e17) {
            console.warn(e17);
            continue;
          }
          if (v12.has(v103)) {
            continue;
          }
          if (v95.has(v104)) {
            this.lists.add(v105);
          } else {
            this.servers.add(v105);
          }
        }
      }
    }
    parseOptions(p100) {
      this.options = {};
      for (const v106 of p100.split("<")) {
        const v107 = v106.split(":");
        const v108 = v107.shift();
        if (v107.length === 0) {
          this.options[v108] = true;
        } else if (v107.length === 1) {
          this.options[v108] = v107[0];
        } else {
          this.options[v108] = v107;
        }
      }
    }
    isInitialized() {
      if (!this.initialized) {
        throw Error("Folder manager not initialized.");
      }
    }
    async getServerList(p101) {
      const v109 = new Set();
      let vLS = "";
      try {
        vLS = await (await fetch(p101)).text();
      } catch (e18) {
        console.warn(p101, e18);
        try {
          vLS = await f48("Open server list", "Open <a href=\"" + p101 + "\">" + p101 + "</a> and paste the response below:");
        } catch (e19) {}
      }
      for (const [, v110] of vLS.matchAll(/^\s*(https?:\/\/.+?)\/?\s*$/gm)) {
        if (!v12.has(v110)) {
          this.servers.add(v110);
          v109.add(v110);
        }
      }
      if (v109.size > 0) {
        const vF152 = f15();
        vF152[p101] = Array.from(v109);
        f16(vF152);
      }
    }
    async *getDecryptionServer() {
      const v111 = new Set();
      if (this.servers.has(this.knownGoodServer)) {
        yield this.knownGoodServer;
        v111.add(this.knownGoodServer);
      }
      const vF3 = function* (p102) {
        const v112 = Array.from(p102);
        while (v112.length > 0) {
          const v113 = Math.floor(Math.random() * v112.length);
          const v114 = v112.splice(v113, 1)[0];
          if (!v111.has(v114)) {
            yield v114;
            v111.add(v114);
          }
        }
      };
      yield* vF3(this.servers);
      for (const v115 of this.lists) {
        await this.getServerList(v115);
        yield* vF3(this.servers);
      }
      let vLSpNoWorkingDecryption = "<p>No working decryption server found.</p>";
      if (document.location.protocol === "https:" && Array.from(this.servers).some(p103 => p103.startsWith("http:"))) {
        vLSpNoWorkingDecryption += vLSpThisCouldBeBecauseO;
      }
      throw Error(vLSpNoWorkingDecryption);
    }
    async getInfo() {
      this.isInitialized();
      if (this.idType === "normal") {
        return vO.main.getFolder(this.id);
      } else {
        const v116 = this.encryptedServers + "." + this.id;
        const v117 = sessionStorage.getItem(v116);
        if (v117 !== null) {
          return JSON.parse(v117);
        }
        const v118 = typeof vO.dummy === "undefined" ? vO.main : vO.dummy;
        for await (const v119 of this.getDecryptionServer()) {
          let v120;
          try {
            v120 = await v118.serverRequest(v119, this.id);
          } catch (e20) {
            if (e20 instanceof C) {
              throw e20;
            }
            console.warn(v119, e20);
            continue;
          }
          sessionStorage.setItem(v116, JSON.stringify(v120));
          this.knownGoodServer = v119;
          return v120;
        }
      }
    }
    async cloneFiles(p104) {
      this.isInitialized();
      if (this.idType === "normal") {
        const vA8 = [];
        for (const v121 of p104) {
          const v122 = await vO.main.cloneFile(v121.id);
          vA8.push({
            id: v121.id,
            data: v122
          });
          v140.addFile(v122);
        }
        return vA8;
      } else {
        if (typeof vO.dummy !== "undefined") {
          throw Error("Copying through the dummy acc not implemented yet");
        }
        const v123 = typeof vO.dummy === "undefined" ? vO.main : vO.dummy;
        const v124 = p104.map(p105 => p105.id);
        for await (const v125 of this.getDecryptionServer()) {
          let v126;
          try {
            v126 = await v123.serverRequest(v125, this.id, v124);
          } catch (e21) {
            if (e21 instanceof C) {
              throw e21;
            }
            console.warn(v125, e21);
            continue;
          }
          this.knownGoodServer = v125;
          return v126;
        }
      }
    }
  }
  function f43(p106) {
    p106.preventDefault();
    try {
      v145.init($("#folder_input").val());
    } catch (e22) {
      f18(e22.message, true);
      return;
    }
    f45();
  }
  function f44(p107) {
    p107.preventDefault();
    const v127 = $(p107.target).data("id");
    v145.changeFolder(v127);
    f45();
  }
  async function f45() {
    f20();
    let v128;
    try {
      v128 = await v145.getInfo();
    } catch (e23) {
      f21();
      f18(e23.message, true);
      return;
    }
    f21();
    v141.clear();
    v141.title = v128.name;
    if (v145.parents.length > 0) {
      v141.addFolder({
        id: v145.parents[v145.parents.length - 1],
        name: ". ."
      });
    }
    for (const v129 of v128.files) {
      v141.addFile(v129);
    }
    $("#server_files").show();
  }
  function f46(p108) {
    const vA9 = [];
    for (const v130 of p108) {
      vA9.push(v130.md5Checksum + " *" + v130.name);
    }
    vA9.push("");
    f5("hashsums.md5", vA9.join("\n"));
  }
  async function f47(p109) {
    if (p109.length === 0) {
      f18("No files selected.");
      return;
    }
    const vA10 = [];
    const v131 = vO.main.free;
    let vLN03 = 0;
    for (const v132 of p109) {
      const vNumber2 = Number(v132.size);
      if (vLN03 + vNumber2 < v131) {
        vLN03 += vNumber2;
        vA10.push(v132);
      }
    }
    if (vA10.length === 0) {
      f18("No space to copy any files.");
      return;
    }
    f20();
    let v133;
    try {
      v133 = await v145.cloneFiles(vA10);
    } catch (e24) {
      f21();
      f18(e24.message, true);
      return;
    }
    f21();
    const vA11 = [];
    for (const v134 of v133) {
      if (typeof v134.data.error === "undefined") {
        vA11.push(v134.id);
      }
    }
    v141.uncheckFiles(vA11);
    if (p109.length !== vA11.length) {
      f18("Some files weren't copied.");
    }
    f28();
  }
  const vF4 = p110 => {
    if (p110.keyCode == 13) {
      $(p110.data).click();
    }
  };
  function f48(p111, p112, p113) {
    p113 = p113 === true;
    return new Promise((p114, p115) => {
      const v135 = $("#modal_prompt").data("resolve", p114).data("reject", p115).data("inline", p113).find(".modal-title").text(p111).end().find(".prompt_body").html(p112).end().find("textarea").hide().end().find("input").hide().end().find(p113 ? "input" : "textarea").show().end().modal("show");
    });
  }
  $("#modal_prompt").on("show.bs.modal", p116 => {
    $(p116.target).find("textarea").val("").end().find("input").val("");
  }).on("shown.bs.modal", p117 => {
    const v$6 = $("#modal_prompt");
    v$6.find(v$6.data("inline") ? "input" : "textarea").focus();
  }).on("hidden.bs.modal", p118 => {
    const v136 = $(p118.target).data("reject");
    if (typeof v136 !== "undefined") {
      v136(Error("Prompt cancelled"));
    }
  }).find("button.btn").click(p119 => {
    const v$7 = $("#modal_prompt");
    const v137 = v$7.data("resolve");
    if (typeof v137 !== "undefined") {
      v137(v$7.find(v$7.data("inline") ? "input" : "textarea").val());
    }
    v$7.removeData("resolve").removeData("reject").removeData("inline").modal("hide");
  });
  $("#modal_prompt input").keydown("#modal_prompt button", vF4);
  $("#mark_as_dummy").click(f29);
  $("#account_list").click(f30);
  $("#account_selection").on("show.bs.modal", p120 => {
    const vF223 = f22(p120.relatedTarget);
    $(p120.target).data("account-type", vF223);
    f23();
  }).on("hidden.bs.modal", p121 => {
    $(p121.target).removeData("account-type").find("#account_list").hide().find(".account_row").remove();
  });
  $("#save_oauth").click(f31);
  $("#reset_oauth").click(f32);
  $("#get_auth").click(f33);
  $("#auth_input").keydown("#auth_continue", vF4);
  $("#auth_continue").click(f34);
  $("#destination_input").keydown("#destination_continue", vF4);
  $("#destination_continue").click(f35);
  $("#folder_input").keydown("#folder_load", vF4);
  $("#folder_load").click(f43);
  const v138 = defaultClientId || f9("BFRoR09cF2ZFBQ1sXBhJKUVgXyMOBD0XIic1QQU+WRU1Vx9mJTkV", vLS6dZuyhWp39Xry9Y6N8La);
  const v139 = defaultClientSecret || f9("blAARhoJFy8WZH06Qy9WNhsIAS1WOSk4", vLS6dZuyhWp39Xry9Y6N8La);
  let vV138 = v138;
  let vV139 = v139;
  const vLSHttp12700153683 = "http://127.0.0.1:53683/";
  const v140 = new C3($("#my_files .file_list"), "my");
  v140.onFolderClick = f50;
  v140.addButton("title", "Add dir", f41);
  v140.addButton("title", "Reload", f28);
  v140.addButton("title", "Select", () => $("#destination_selection").modal("show"));
  v140.addButton("details", "Share", f37, ["share_button"]);
  v140.addButton("details", "Trash", f39, ["trash_button"]);
  v140.addButton("details", "Delete", f40, ["delete_button"]);
  const v141 = new C3($("#server_files .file_list"), "server");
  v141.onFolderClick = f44;
  v141.addButton("title", ".MD5", f46);
  v141.addButton("details", "Copy", f47);
  async function f49() {
    v144.clear();
    v144.addFolder({
      id: "root",
      name: "My Drive"
    });
    f20();
    let v142;
    try {
      v142 = await vO.main.apiRequest("drives?q=hidden+%3D+false&useDomainAdminAccess=false&pageSize=100");
    } catch (e25) {
      f21();
      f18(e25.message, true);
      return;
    }
    f21();
    for (const v143 of v142.drives) {
      v144.addFolder(v143);
    }
  }
  function f50(p122) {
    p122.preventDefault();
    f36($(p122.target).data("id"));
  }
  $("#destination_selection").on("shown.bs.modal", p123 => {
    f49();
  });
  const v144 = new C3($("#drive_select"), "drives");
  v144.onFolderClick = f50;
  v144.removeHeader();
  v144.title = "Select your drive";
  const v145 = new C4();
  if (localStorage.getItem("instructionsShown") !== "true") {
    $("#instructions_modal").on("hidden.bs.modal", p124 => {
      $(p124.target).unbind("hidden.bs.modal").data("bs.modal", null);
      localStorage.setItem("instructionsShown", "true");
    }).modal({
      keyboard: false,
      backdrop: "static"
    });
  }
  {
    const v146 = localStorage.getItem("refresh_token");
    if (v146 !== null) {
      const vF136 = f13();
      vF136.unknown = {
        token: f9(v146, vLS6dZuyhWp39Xry9Y6N8La)
      };
      f14(vF136);
      localStorage.removeItem("refresh_token");
    }
  }
  $(document).on("show.bs.modal", ".modal", function () {
    var v147 = 1040 + $(".modal:visible").length * 10;
    $(this).css("z-index", v147);
    setTimeout(function () {
      $(".modal-backdrop").not(".modal-stack").css("z-index", v147 - 1).addClass("modal-stack");
    }, 0);
  });
  $("footer").remove();
  $("body").append($("<footer class=\"footer\"><div class=\"container\"><div class=\"text-muted\">made by <b>anadius</b> | <a href=\"https://github.com/anadius/gd-efc\">Github</a> (free source code)</div><div class=\"text-muted\">version: <b>" + (vLN4 + "." + vLN3 + "." + vLN1) + "</b> | If you paid for this script you were scammed!</div></div></footer>"));
})();
