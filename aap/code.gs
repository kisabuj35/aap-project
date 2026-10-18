/**
 * আউলিয়াপুর অগ্রযাত্রা পরিষদ - ডিজিটাল পোর্টাল ERP মাস্টার ইঞ্জিন
 * কাস্টম ডোমেইন সামঞ্জস্যপূর্ণ সংস্করণ
 */

var SPREADSHEET_ID = "1zuipe8gGTBu3h9D4Pq01JZFFJJazoaRre7sKy7NiK-E"; 

// ==========================================
// ডাটাবেজ কানেকশন ওভাররাইডার ট্রিক
// ==========================================
var originalGetActiveSpreadsheet = SpreadsheetApp.getActiveSpreadsheet;
SpreadsheetApp.getActiveSpreadsheet = function() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (err) {
    return originalGetActiveSpreadsheet();
  }
};
// ==========================================

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('ড্যাশবোর্ড')
      .addItem('ড্যাশবোর্ড খুলুন', 'showSearchBox')
      .addToUi();
}

function showSearchBox() {
  var html = HtmlService.createHtmlOutputFromFile('index')
      .setWidth(1000)
      .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, 'ড্যাশবোর্ডে আপনাকে স্বাগতম');
}

function loadPage(pageName) {
  try {
    return HtmlService.createTemplateFromFile(pageName).evaluate().getContent();
  } catch (error) {
    return "<div class='text-center py-10 font-bold text-red-500'>পেজ লোড করতে ত্রুটি ঘটেছে!</div>";
  }
}

// =========================================================================
// কাস্টম ডোমেইন ডাটা রাউটার (GET & POST) - CORS মুক্ত ডাটা ট্রানজেকশন নিশ্চিতকরণ
// =========================================================================

function doGet(e) {
  try {
    var action = e ? e.parameter.action : null;
    
    // নির্দিষ্ট অ্যাকশন ফাংশন রান করানো
    if (action && typeof this[action] === 'function') {
      var params = e.parameter.params ? JSON.parse(e.parameter.params) : [];
      var result = this[action].apply(null, Array.isArray(params) ? params : [params]);
      
      var callback = e.parameter.callback;
      var jsonResponse = JSON.stringify({ status: "success", data: result });
      
      if (callback) {
        return ContentService.createTextOutput(callback + "(" + jsonResponse + ")")
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(jsonResponse)
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Auliyapur ERP Master Engine API is live!" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var requestData = JSON.parse(e.postData.contents);
    var action = requestData.action;
    var args = requestData.arguments || [];
    
    if (typeof this[action] === 'function') {
      var result = this[action].apply(null, args);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", data: result }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "সিস্টেম ত্রুটি: '" + action + "' নামক কোনো ফাংশন সার্ভারে পাওয়া যায়নি।" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// ব্যাকএন্ড হেলপার ফাংশনসমূহ
// ==========================================

var ADMIN_PASSCODE = "AAP2026"; 
function verifyAdminPasscode(passcode) {
  if (passcode === ADMIN_PASSCODE) {
    return { success: true };
  }
  return { success: false, message: "ভুল পাসকোড! দয়া করে সঠিক পাসকোড দিয়ে আবার চেষ্টা করুন।" };
}

function toBnDigits(str) {
  if (str === undefined || str === null) return "০";
  var bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return str.toString().replace(/[0-9]/g, function(w) { return bnDigits[+w]; });
}

function toEnDigits(str) {
  if (str === undefined || str === null || str === "") return "0";
  var enDigits = { "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9" };
  return str.toString().replace(/[০-৯]/g, function(w) { return enDigits[w]; });
}

function formatPhoneWithZero(phone) {
  if (!phone) return "";
  var str = phone.toString().trim().replace(/[^0-9]/g, '');
  if (str.length === 10 && str.startsWith('1')) {
    str = '0' + str;
  }
  return "'" + str; 
}

function cleanDateFormat(cellVal) {
  if (!cellVal) return "N/A";
  try {
    if (cellVal instanceof Date) {
      return Utilities.formatDate(cellVal, "GMT+6", "dd-MM-yyyy");
    }
    var d = new Date(cellVal);
    if (!isNaN(d.getTime())) {
      return Utilities.formatDate(d, "GMT+6", "dd-MM-yyyy");
    }
    return cellVal.toString();
  } catch (e) {
    return cellVal.toString();
  }
}

function calculateFiscalYear(dateStr) {
  try {
    var cleanDate = toEnDigits(dateStr);
    var parts = cleanDate.split("-");
    if (parts.length !== 3) return "অজানা";
    var year = parseInt(parts[2], 10);
    var month = parseInt(parts[1], 10);
    var fy = (month >= 7) ? year + "-" + (year + 1) : (year - 1) + "-" + year;
    return toBnDigits(fy);
  } catch (e) { return "অজানা"; }
}

function getMonthsPassed(joinDateStr, endDateStr) {
  try {
    if (!joinDateStr || joinDateStr === "N/A" || joinDateStr === "") return 0;
    var joinParts = toEnDigits(joinDateStr).split("-");
    var joinDate = new Date(parseInt(joinParts[2], 10), parseInt(joinParts[1], 10) - 1, 1);
    
    var today = new Date();
    var targetDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    if (endDateStr && endDateStr !== "N/A" && endDateStr !== "") {
      var endParts = toEnDigits(endDateStr).split("-");
      targetDate = new Date(parseInt(endParts[2], 10), parseInt(endParts[1], 10) - 1, 1);
      targetDate.setMonth(targetDate.getMonth() - 1);
    }
    
    var months = (targetDate.getFullYear() - joinDate.getFullYear()) * 12;
    months -= joinDate.getMonth();
    months += targetDate.getMonth();
    
    return months >= 0 ? months + 1 : 0;
  } catch (e) { return 0; }
}

function getOverlappingMonths(joinDateStr, endDateStr, startFilterStr, endFilterStr) {
  try {
    if (!joinDateStr || joinDateStr === "N/A" || joinDateStr === "") return 0;
    
    var joinParts = toEnDigits(joinDateStr).split("-");
    var joinDate = new Date(parseInt(joinParts[2], 10), parseInt(joinParts[1], 10) - 1, 1);
    
    var today = new Date();
    var activeEndDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    if (endDateStr && endDateStr !== "N/A" && endDateStr !== "") {
      var endParts = toEnDigits(endDateStr).split("-");
      activeEndDate = new Date(parseInt(endParts[2], 10), parseInt(endParts[1], 10) - 1, 1);
      activeEndDate.setMonth(activeEndDate.getMonth() - 1); 
    }
    
    var startFilter = null;
    if (startFilterStr && startFilterStr !== "") {
      var sParts = startFilterStr.split("-");
      startFilter = new Date(parseInt(sParts[0], 10), parseInt(sParts[1], 10) - 1, 1);
    }
    
    var endFilter = null;
    if (endFilterStr && endFilterStr !== "") {
      var eParts = endFilterStr.split("-");
      endFilter = new Date(parseInt(eParts[0], 10), parseInt(eParts[1], 10) - 1, 1);
    }
    
    var finalStart = joinDate;
    if (startFilter && startFilter > finalStart) { finalStart = startFilter; }
    
    var finalEnd = activeEndDate;
    if (endFilter && endFilter < finalEnd) { finalEnd = endFilter; }
    
    if (finalStart > finalEnd) return 0;
    
    var months = (finalEnd.getFullYear() - finalStart.getFullYear()) * 12;
    months -= finalStart.getMonth();
    months += finalEnd.getMonth();
    
    return months >= 0 ? months + 1 : 0;
  } catch (e) { return 0; }
}

function isDateInFilterRange(dateStr, startMonthStr, endMonthStr) {
  try {
    if (!dateStr) return false;
    var cleanDate = toEnDigits(dateStr.split(" ")[0]);
    var parts = cleanDate.split("-");
    var d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, 1);
    
    if (startMonthStr) {
      var sParts = startMonthStr.split("-");
      var start = new Date(parseInt(sParts[0], 10), parseInt(sParts[1], 10) - 1, 1);
      if (d < start) return false;
    }
    if (endMonthStr) {
      var eParts = endMonthStr.split("-");
      var end = new Date(parseInt(eParts[0], 10), parseInt(eParts[1], 10) - 1, 1);
      if (d > end) return false;
    }
    return true;
  } catch (e) { return false; }
}

function uploadToGoogleDrive(base64Data, fileName) {
  try {
    if (!base64Data || typeof base64Data !== 'string') return "";
    var trimmed = base64Data.trim();
    if (trimmed.indexOf("http") === 0) return trimmed; // সরাসরি ইমেজ লিংক থাকলে সেটিই রিটার্ন করবে

    var folderName = "Website_Uploads";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

    var contentType = "image/jpeg";
    var cleanBase64 = trimmed;

    if (trimmed.indexOf(';base64,') !== -1) {
      contentType = trimmed.substring(5, trimmed.indexOf(';'));
      cleanBase64 = trimmed.split(';base64,')[1];
    } else if (trimmed.indexOf(',') !== -1) {
      cleanBase64 = trimmed.split(',')[1];
    }

    cleanBase64 = cleanBase64.replace(/\s/g, ''); // অপ্রয়োজনীয় স্পেস রিমুভ

    var bytes = Utilities.base64Decode(cleanBase64);
    if (!bytes || bytes.length === 0) {
      return "";
    }
    
    var blob = Utilities.newBlob(bytes, contentType, fileName || "uploaded_image.jpg");
    var file = folder.createFile(blob);

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return "https://lh3.googleusercontent.com/d/" + file.getId();
  } catch (error) {
    throw new Error("ফাইল আপলোড ব্যর্থ হয়েছে: " + error.toString());
  }
}

// ==========================================
// ১. সদস্য নিবন্ধন প্রসেসর (ডাটাবেজ কলাম সিঙ্ক)
// ==========================================
function submitMemberRegistration(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("সদস্য_তালিকা") || ss.getSheetByName("সদস্য তথ্য ট্র্যাকার");
    if (!sheet) return { success: false, error: "সদস্য_তালিকা শিট পাওয়া যায়নি!" };
    
    var lastRow = sheet.getLastRow();
    var nextNum = 1;
    if (lastRow > 1) {
      var lastId = sheet.getRange(lastRow, 1).getValue().toString();
      var matches = lastId.match(/\d+/);
      if (matches) {
        nextNum = parseInt(matches[0], 10) + 1;
      }
    }
    var memberId = "AAP" + String(nextNum).padStart(3, '0');
    
    var photoUrl = "";
    if (payload.photoData && payload.photoData.trim() !== "") {
      try {
        photoUrl = uploadToGoogleDrive(payload.photoData, payload.photoName || (memberId + ".jpg"));
      } catch(e) {
        photoUrl = "";
      }
    }

    var addressText = payload.address || "";
    var cleanPhone = formatPhoneWithZero(payload.phone);

    var rowData = [
      memberId,                                // Col A (1): সদস্য আইডি
      payload.name || "",                      // Col B (2): সদস্যের নাম
      payload.fatherName || "",                // Col C (3): পিতার নাম
      payload.designation || "সাধারণ সদস্য",   // Col D (4): সংগঠনে পদবী
      addressText,                             // Col E (5): ঠিকানা (একক টেক্সট)
      cleanPhone,                              // Col F (6): মোবাইল নম্বর
      payload.joinDate || "",                  // Col G (7): যোগদানের তারিখ
      payload.nid || "",                       // Col H (8): এনআইডি
      payload.profession || "",                // Col I (9): পেশা
      payload.bloodGroup || "",                // Col J (10): রক্তের গ্রুপ
      payload.email || "",                     // Col K (11): ইমেইল
      payload.fbLink || "",                    // Col L (12): ফেসবুক লিংক
      payload.comments || "",                  // Col M (13): মন্তব্য
      payload.monthlyFee || 0,                 // Col N (14): মাসিক নির্ধারিত ফি
      photoUrl,                                // Col O (15): ছবি URL
      "পেন্ডিং",                               // Col P (16): অবস্থা (অনুমোদনের জন্য পেন্ডিং রাখা হলো)
      "",                                      // Col Q (17): অকার্যকর তারিখ
      payload.memberType || "সাধারণ সদস্য",   // Col R (18): সদস্যের ধরণ
      payload.motherName || "",                // Col S (19): মাতার নাম
      payload.gender || "",                    // Col T (20): লিঙ্গ
      payload.education || ""                  // Col U (21): শিক্ষাগত যোগ্যতা
    ];
    
    sheet.appendRow(rowData);
    return { success: true, memberId: memberId };
    
  } catch(err) {
    return { success: false, error: err.toString() };
  }
}

function getCampaignLedger() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("প্রকল্প_ও_ত্রাণ");
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    var list = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if(!row[1]) continue;
      list.push({
        rowIdx: i + 1,
        date: row[0] ? cleanDateFormat(row[0]) : "",
        title: row[1] ? row[1].toString().trim() : "",
        sector: row[2] ? row[2].toString().trim() : "",
        amount: row[3] ? row[3].toString().trim() : "০",
        desc: row[4] ? row[4].toString().trim() : "",
        status: row[5] ? row[5].toString().trim() : "",
        location: row[6] ? row[6].toString().trim() : "আউলিয়াপুর"
      });
    }
    return list;
  } catch(e) {
    return [];
  }
}

function getAdminFinancialReport(selectedFY, startMonth, endMonth) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var cashSheet = ss.getSheetByName("আর্থিক_হিসাব");
    var infoSheet = ss.getSheetByName("সদস্য_তালিকা") || ss.getSheetByName("সদস্য তথ্য ট্র্যাকার");
    var paySheet = ss.getSheetByName("চাঁদা_পরিশোধ") || ss.getSheetByName("সদস্য চাঁদা ট্র্যাকার");
    var bloodSheet = ss.getSheetByName("রক্তদান_লগ") || ss.getSheetByName("রক্তদান কর্মসূচি ট্র্যাকার");
    var committeeSheet = ss.getSheetByName("কমিটি_তালিকা");
    var projSheet = ss.getSheetByName("প্রকল্প_ও_ত্রাণ");
    
    var report = {
      fyOptions: ["সর্বমোট", "২০২৫-২০২৬", "২০২৬-২০২৭", "২০২৭-২০২৮", "২০২৮-২০২৯", "২০২৯-২০৩০"],
      totalIncome: 0, totalExpense: 0, netBalance: 0, totalDues: 0, membersCount: 0,
      committeeCount: 0, advisorsCount: 0, donorsCount: 0, lifetimeMembersCount: 0, 
      bloodDonationsCount: 0, completedCampaigns: "০", ongoingCampaigns: "০",
      categories: { formFee: 0, monthlyFee: 0, specialDonation: 0, publicDonation: 0, educationSector: 0, medicalSector: 0, financialHelp: 0, officeSector: 0, specialSector: 0, otherSector: 0 },
      memberLedger: [],
      cashbookTransactions: [], 
      bloodStats: { "A+": 0, "B+": 0, "AB+": 0, "O+": 0, "A-": 0, "B-": 0, "AB-": 0, "O-": 0 },
      donationBloodStats: { "A+": 0, "B+": 0, "AB+": 0, "O+": 0, "A-": 0, "B-": 0, "AB-": 0, "O-": 0 } 
    };

    if (cashSheet) {
      var cashData = cashSheet.getDataRange().getValues();
      for (var i = 1; i < cashData.length; i++) {
        var row = cashData[i];
        var date = row[0] ? cleanDateFormat(row[0]) : "";
        var type = row[1] ? row[1].toString().trim() : "";
        var sector = row[2] ? row[2].toString().trim() : "";
        var amount = parseFloat(toEnDigits(row[3])) || 0;
        var remarks = row[4] ? row[4].toString().trim() : "";
        
        if (!date) continue;
        var fy = calculateFiscalYear(date);
        
        if (report.fyOptions.indexOf(fy) === -1 && fy !== "অজানা") {
          report.fyOptions.push(fy);
        }
        
        var matchFY = (selectedFY === "সর্বমোট" || selectedFY === fy);
        var matchRange = isDateInFilterRange(date, startMonth, endMonth);
        
        if (matchFY && matchRange) {
          report.cashbookTransactions.push({
            rowIdx: i + 1,
            date: date, type: type, sector: sector, amount: toBnDigits(amount), remarks: remarks
          });

          if (type === "আয়") {
            report.totalIncome += amount;
            if (sector.includes("ফরম")) {
              report.categories.formFee += amount;
            } else if (sector.includes("ডোনে") || sector.includes("অনু") || sector.includes("দান")) {
              if (sector.includes("AAP") || (sector.includes("ID:") && !sector.includes("ডোনার"))) {
                report.categories.specialDonation += amount;
              } else {
                report.categories.publicDonation += amount;
              }
            } else if (sector.includes("চাঁদা") || sector.includes("চাদা")) {
              report.categories.monthlyFee += amount;
            } else {
              report.categories.publicDonation += amount;
            }
          } else if (type === "ব্যয়") {
            report.totalExpense += amount;
            if (sector.includes("শিক্ষা")) report.categories.educationSector += amount;
            else if (sector.includes("চিকিৎসা")) report.categories.medicalSector += amount;
            else if (sector.includes("সাহায্য")) report.categories.financialHelp += amount;
            else if (sector.includes("অফিস")) report.categories.officeSector += amount; 
            else if (sector.includes("বিশেষ")) report.categories.specialSector += amount;
            else report.categories.otherSector += amount;
          }
        }
      }
    }
    
    report.netBalance = report.totalIncome - report.totalExpense;

    var infoData = infoSheet ? infoSheet.getDataRange().getValues() : [];
    var payData = paySheet ? paySheet.getDataRange().getValues() : [];
    
    var paymentsMap = {}; 
    var donationsMap = {}; 
    
    if (payData.length > 1) {
      var payHeaderIdx = findHeaderRow(payData);
      var payHeaders = payData[payHeaderIdx].map(function(h) { return h.toString().trim(); });
      var pIdIdx = findColumnIndexByKeywords(payHeaders, ["আইডি", "id", "নাম্বার"]);
      var pAmountIdx = findColumnIndexByKeywords(payHeaders, ["টাকা", "amount", "পরিমাণ"]);
      var pStatusIdx = findColumnIndexByKeywords(payHeaders, ["অবস্থা", "status", "অনুমোদন"]);
      var pMonthIdx = findColumnIndexByKeywords(payHeaders, ["মাস", "month", "বিবরণ"]);

      for (var i = payHeaderIdx + 1; i < payData.length; i++) {
        var row = payData[i];
        var date = row[0] ? cleanDateFormat(row[0]) : "";
        var id = pIdIdx !== -1 && row[pIdIdx] ? row[pIdIdx].toString().trim() : "";
        var amount = pAmountIdx !== -1 ? parseFloat(toEnDigits(row[pAmountIdx])) || 0 : 0;
        var pStatus = pStatusIdx !== -1 ? row[pStatusIdx].toString().trim() : "পেন্ডিং";
        var monthDesc = pMonthIdx !== -1 && row[pMonthIdx] ? row[pMonthIdx].toString().trim() : "";
        
        if (id && (pStatus === "অনুমোদিত" || pStatus === "সক্রিয়") && isDateInFilterRange(date, startMonth, endMonth)) {
          var fy = calculateFiscalYear(date);
          if (selectedFY === "সর্বমোট" || selectedFY === fy) {
            var isDonation = false;
            var lowerDesc = monthDesc.toLowerCase();
            if (lowerDesc.includes("ডোনে") || lowerDesc.includes("অনু") || lowerDesc.includes("সাহা") || lowerDesc.includes("দান") || lowerDesc.includes("dona") || lowerDesc.includes("help") || lowerDesc.includes("উপহার")) {
              if (lowerDesc.includes("ভর্তি") || lowerDesc.includes("ফরম")) {
                isDonation = false;
              } else {
                isDonation = true;
              }
            }
            
            if (isDonation) {
              donationsMap[id] = (donationsMap[id] || 0) + amount;
            } else {
              paymentsMap[id] = (paymentsMap[id] || 0) + amount;
            }
          }
        }
      }
    }

    var lifetimeCount = 0; 
    if (infoData.length > 1) {
      var headerRowIdx = findHeaderRow(infoData);
      for (var i = headerRowIdx + 1; i < infoData.length; i++) {
        var row = infoData[i];
        var id = row[0] ? row[0].toString().trim() : "";
        
        var status = row[15] ? row[15].toString().trim() : ""; 
        if (status === "") status = "সক্রিয়"; 
        var endDate = row[16] ? cleanDateFormat(row[16]) : "";
        
        if (!id || id.toLowerCase() === "id" || id.indexOf("আইডি") !== -1) continue;
        if (status === "পেন্ডিং" || status === "আবেদনাধীন") continue;

        var cleanJoinDate = cleanDateFormat(row[6]); 
        var months = getOverlappingMonths(cleanJoinDate, endDate, startMonth, endMonth);
        if ((startMonth || endMonth) && months === 0) continue; 

        report.membersCount++;

        var memberType = row[17] ? row[17].toString().trim() : "সাধারণ সদস্য";
        if (memberType.includes("আজীবন") || memberType.includes("আজীবনের")) {
          lifetimeCount++;
        }

        var name = row[1] ? row[1].toString().trim() : "";
        var monthlyFee = parseFloat(toEnDigits(row[13])) || 0;
        var totalAccrued = months * monthlyFee;
        var formFee = 50; 
        var totalAccruedWithForm = totalAccrued + formFee;
        
        var totalPaid = paymentsMap[id] || 0;
        var due = totalAccruedWithForm - totalPaid;
        due = due > 0 ? due : 0;
        
        report.totalDues += due;

        var bloodGrp = row[9] ? row[9].toString().trim() : "N/A";
        bloodGrp = bloodGrp.replace(/\s+/g, '').toUpperCase();
        if (report.bloodStats[bloodGrp] !== undefined) {
          report.bloodStats[bloodGrp]++;
        }
        
        report.memberLedger.push({
          rowIdx: i + 1,
          id: id, name: name, status: status, joinDate: cleanJoinDate, endDate: endDate ? endDate : "-",
          months: toBnDigits(months), monthlyFee: toBnDigits(monthlyFee), totalAccrued: toBnDigits(totalAccruedWithForm),
          totalPaid: toBnDigits(totalPaid), due: toBnDigits(due), phone: row[5] ? row[5].toString().trim() : "",
          designation: row[3] ? row[3].toString().trim() : "সাধারণ সদস্য"
        });
      }
    }
    report.lifetimeMembersCount = toBnDigits(lifetimeCount);

    if (bloodSheet) {
      var bData = bloodSheet.getDataRange().getValues();
      var approvedBloodCount = 0;
      if (bData.length > 1) {
        var bHeaders = bData[0].map(function(h) { return h.toString().trim(); });
        var bGrpIdx = findColumnIndexByKeywords(bHeaders, ["গ্রুপ", "blood", "group"]);
        
        for (var i = 1; i < bData.length; i++) {
          var bStatus = bData[i][15] ? bData[i][15].toString().trim() : "পেন্ডিং";
          if (bStatus === "অনুমোদিত" || bStatus === "সক্রিয়") {
            approvedBloodCount++;
            if (bGrpIdx !== -1) {
              var donationBloodGrp = bData[i][bGrpIdx] ? bData[i][bGrpIdx].toString().trim() : "";
              donationBloodGrp = donationBloodGrp.replace(/\s+/g, '').toUpperCase();
              if (report.donationBloodStats[donationBloodGrp] !== undefined) {
                report.donationBloodStats[donationBloodGrp]++;
              }
            }
          }
        }
      }
      report.bloodDonationsCount = toBnDigits(approvedBloodCount);
    }

    if (committeeSheet) {
      var cData = committeeSheet.getDataRange().getValues();
      var execCount = 0; var advCount = 0; var donorCount = 0;
      for (var i = 1; i < cData.length; i++) {
        var type = cData[i][0] ? cData[i][0].toString().trim() : "";
        if (type === "কার্যনির্বাহী কমিটি") execCount++;
        if (type === "উপদেষ্টা মণ্ডলী") advCount++;
        if (type === "ডোনার ও পার্টনার") donorCount++;
      }
      report.committeeCount = toBnDigits(execCount);
      report.advisorsCount = toBnDigits(advCount);
      report.donorsCount = toBnDigits(donorCount);
    }

    var completedCount = 0;
    var ongoingCount = 0;
    if (projSheet) {
      var pData = projSheet.getDataRange().getValues();
      if (pData.length > 1) {
        var pHeader = pData[0].map(function(h) { return h.toString().trim(); });
        var statusColIdx = findColumnIndexByKeywords(pHeader, ["অবস্থা", "স্ট্যাটাস", "status"]);
        
        if (statusColIdx !== -1) {
          for (var i = 1; i < pData.length; i++) {
            var pStatus = pData[i][statusColIdx].toString().trim();
            if (pStatus.includes("চলমান") || pStatus.includes("আসন্ন") || pStatus === "হাতে নেওয়া") {
              ongoingCount++;
            } else {
              completedCount++;
            }
          }
        } else {
          completedCount = pData.length - 1;
          ongoingCount = 0;
        }
      }
    }
    report.completedCampaigns = toBnDigits(completedCount);
    report.ongoingCampaigns = toBnDigits(ongoingCount);

    report.totalIncome = toBnDigits(report.totalIncome);
    report.totalExpense = toBnDigits(report.totalExpense);
    report.netBalance = toBnDigits(report.netBalance);
    report.totalDues = toBnDigits(report.totalDues);
    report.membersCount = toBnDigits(report.membersCount);
    
    for (var key in report.categories) {
      report.categories[key] = toBnDigits(report.categories[key]);
    }

    return report;
  } catch (e) {
    return { error: e.toString() };
  }
}

// ==========================================
// ২. সদস্য ডাটা রিডার (পাবলিক সার্চে পেন্ডিং মেম্বার ফিল্টারিং ফিক্স)
// ==========================================
function getAuliyapurData() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var response = { summary: {}, ledgers: [] };

    var infoSheet = ss.getSheetByName("সদস্য_তালিকা") || ss.getSheetByName("সদস্য তথ্য ট্র্যাকার");
    var paySheet = ss.getSheetByName("চাঁদা_পরিশোধ") || ss.getSheetByName("সদস্য চাঁদা ট্র্যাকার");
    var bloodSheet = ss.getSheetByName("রক্তদান_লগ") || ss.getSheetByName("রক্তদান কর্মসূচি ট্র্যাকার");
    
    var infoData = infoSheet ? infoSheet.getDataRange().getValues() : [];
    var payData = paySheet ? paySheet.getDataRange().getValues() : [];
    var bloodData = bloodSheet ? bloodSheet.getDataRange().getValues() : [];
    var membersMap = {};

    var bloodCountMap = {};
    if (bloodSheet && bloodData.length > 1) {
      for (var i = 1; i < bloodData.length; i++) {
        var row = bloodData[i];
        var donorId = row[2] ? row[2].toString().trim() : "";
        var bStatus = row[15] ? row[15].toString().trim() : "পেন্ডিং";
        if (donorId && (bStatus === "অনুমোদিত" || bStatus === "সক্রিয়")) {
          bloodCountMap[donorId] = (bloodCountMap[donorId] || 0) + 1;
        }
      }
    }

    if (infoData.length > 1) { 
      for (var i = 1; i < infoData.length; i++) {
        var row = infoData[i];
        var id = row[0] ? row[0].toString().trim() : "";
        var status = row[15] ? row[15].toString().trim() : "";
        var endDate = row[16] ? cleanDateFormat(row[16]) : "";
        
        if (!id || id.toLowerCase() === "id" || id.indexOf("আইডি") !== -1) continue;
        
        // 🔴 বুলেটপ্রুফ ফিল্টার: স্ট্যাটাস যদি হুবহু "সক্রিয়" না হয়, তাহলে সার্চ পোর্টাল ও ওয়েবসাইটে কখনোই যাবে না
        if (status !== "সক্রিয়") {
          continue; 
        }
        
        var monthlyFee = parseFloat(toEnDigits(row[13])) || 0;
        var cleanJoinDate = cleanDateFormat(row[6]);
        var months = getMonthsPassed(cleanJoinDate, endDate);
        var totalAccrued = (months * monthlyFee) + 50; 

        var rawPhone = row[5] ? row[5].toString().trim() : "";
        if (rawPhone.startsWith("'")) rawPhone = rawPhone.substring(1);

        membersMap[id] = {
          rowIdx: i + 1,
          id: id, 
          name: row[1] ? row[1].toString().trim() : "সদস্য", 
          fatherName: row[2] ? row[2].toString().trim() : "N/A",
          designation: row[3] ? row[3].toString().trim() : "সাধারণ সদস্য", 
          address: row[4] ? row[4].toString().trim() : "আউলিয়াপুর",
          phone: rawPhone, 
          joinDate: cleanJoinDate, 
          nid: row[7] ? row[7].toString().trim() : "N/A", 
          profession: row[8] ? row[8].toString().trim() : "N/A",
          bloodGroup: row[9] ? row[9].toString().trim() : "N/A",
          email: row[10] ? row[10].toString().trim() : "N/A", 
          fbLink: row[11] ? row[11].toString().trim() : "#",   
          comments: row[12] ? row[12].toString().trim() : "N/A", 
          monthlyFee: toBnDigits(monthlyFee), 
          photo: row[14] ? row[14].toString().trim() : "",
          status: status,
          memberType: row[17] ? row[17].toString().trim() : "সাধারণ সদস্য",
          motherName: row[18] ? row[18].toString().trim() : "N/A",
          gender: row[19] ? row[19].toString().trim() : "N/A",
          education: row[20] ? row[20].toString().trim() : "N/A",
          totalSubscription: toBnDigits(totalAccrued),
          months: toBnDigits(months), 
          totalPaid: 0, totalDonations: 0, specialDonation: 0, grandTotalPaid: 0, totalDue: 0,
          bloodDonationsCount: toBnDigits(bloodCountMap[id] || 0) 
        };
      }
    }

    var subscriptionPaidMap = {};
    var donationPaidMap = {};

    if (payData.length > 1) {
      for (var i = 1; i < payData.length; i++) {
        var row = payData[i];
        var id = row[1] ? row[1].toString().trim() : "";
        var amount = parseFloat(toEnDigits(row[4])) || 0;
        var pStatus = row[8] ? row[8].toString().trim() : "পেন্ডিং";
        var monthDesc = row[3] ? row[3].toString().trim() : "";
        
        if (id && (pStatus === "অনুমোদিত" || pStatus === "সক্রিয়")) { 
          var lowerDesc = monthDesc.toLowerCase();
          var isDonation = !(lowerDesc.includes("জানু") || lowerDesc.includes("ফেব্রু") || lowerDesc.includes("মার্চ") || lowerDesc.includes("এপ্রিল") || lowerDesc.includes("মে") || lowerDesc.includes("জুন") || lowerDesc.includes("জুলা") || lowerDesc.includes("আগস্ট") || lowerDesc.includes("সেপ্টে") || lowerDesc.includes("অক্টো") || lowerDesc.includes("নভেম") || lowerDesc.includes("ডিসে") || lowerDesc.includes("ভর্তি") || lowerDesc.includes("ফরম") || lowerDesc.includes("ফি") || lowerDesc.includes("চাঁদা") || lowerDesc.includes("চাদা"));
          
          if (isDonation) {
            donationPaidMap[id] = (donationPaidMap[id] || 0) + amount;
          } else {
            subscriptionPaidMap[id] = (subscriptionPaidMap[id] || 0) + amount;
          }
        }
      }
    }

    for (var id in membersMap) {
      var member = membersMap[id];
      var subPaid = subscriptionPaidMap[id] || 0;
      var donPaid = donationPaidMap[id] || 0;
      var grandTotal = subPaid + donPaid;
      
      var due = parseFloat(toEnDigits(member.totalSubscription)) - subPaid;
      due = due > 0 ? due : 0;
      
      member.totalPaid = toBnDigits(subPaid);         
      member.specialDonation = toBnDigits(donPaid);    
      member.totalDonations = toBnDigits(donPaid);     
      member.grandTotalPaid = toBnDigits(grandTotal);  
      member.totalDue = toBnDigits(due);              
      
      response.ledgers.push(member);
    }
    return response;
  } catch (e) { return { error: e.toString() }; }
}

function getAdminMemberList() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("সদস্য_তালিকা") || ss.getSheetByName("সদস্য তথ্য ট্র্যাকার");
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    var list = [];
    var headerRowIdx = findHeaderRow(data);
    for (var i = headerRowIdx + 1; i < data.length; i++) {
      var row = data[i];
      var id = row[0] ? row[0].toString().trim() : "";
      if (!id || id.toLowerCase() === "id" || id.indexOf("আইডি") !== -1) continue;
      
      list.push({
        rowIdx: i + 1,
        id: id,
        name: row[1] ? row[1].toString().trim() : "",
        fatherName: row[2] ? row[2].toString().trim() : "",
        designation: row[3] ? row[3].toString().trim() : "",
        address: row[4] ? row[4].toString().trim() : "",
        phone: row[5] ? row[5].toString().trim() : "",
        joinDate: row[6] ? cleanDateFormat(row[6]) : "",
        nid: row[7] ? row[7].toString().trim() : "",
        profession: row[8] ? row[8].toString().trim() : "",
        bloodGroup: row[9] ? row[9].toString().trim() : "",
        email: row[10] ? row[10].toString().trim() : "", 
        fbLink: row[11] ? row[11].toString().trim() : "", 
        comments: row[12] ? row[12].toString().trim() : "", 
        monthlyFee: row[13] ? row[13].toString().trim() : "০",
        photo: row[14] ? row[14].toString().trim() : "",
        status: row[15] ? row[15].toString().trim() : "পেন্ডিং",
        endDate: row[16] ? cleanDateFormat(row[16]) : "",
        memberType: row[17] ? row[17].toString().trim() : "সাধারণ সদস্য",
        motherName: row[18] ? row[18].toString().trim() : "",
        gender: row[19] ? row[19].toString().trim() : "",
        education: row[20] ? row[20].toString().trim() : ""
      });
    }
    return list;
  } catch (e) { return []; }
}

function getCommitteeData() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("কমিটি_তালিকা");
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    var list = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var type = row[0] ? row[0].toString().trim() : "";
      if (!type) continue;
      
      list.push({
        rowIdx: i + 1, 
        type: type,
        name: row[1] ? row[1].toString().trim() : "",
        fatherName: row[2] ? row[2].toString().trim() : "",
        motherName: row[3] ? row[3].toString().trim() : "",
        nid: row[4] ? row[4].toString().trim() : "",
        phone: row[5] ? row[5].toString().trim() : "",
        email: row[6] ? row[6].toString().trim() : "",
        gender: row[7] ? row[7].toString().trim() : "",
        bloodGroup: row[8] ? row[8].toString().trim() : "",
        designation: row[9] ? row[9].toString().trim() : "",
        profession: row[10] ? row[10].toString().trim() : "",
        education: row[11] ? row[11].toString().trim() : "",
        org: row[12] ? row[12].toString().trim() : "",
        fbLink: row[13] ? row[13].toString().trim() : "",
        message: row[14] ? row[14].toString().trim() : "",
        photo: row[15] ? row[15].toString().trim() : "",
        startDate: row[16] ? cleanDateFormat(row[16]) : "",
        endDate: row[17] ? cleanDateFormat(row[17]) : "",
        address: row[18] ? row[18].toString().trim() : ""
      });
    }
    return list;
  } catch (e) {
    return [];
  }
}

function submitCommittee(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("কমিটি_তালিকা");
    
    if (!sheet) {
      sheet = ss.insertSheet("কমিটি_তালিকা");
      sheet.appendRow([
        "কমিটি টাইপ", "নাম", "পিতার নাম", "মাতার নাম", "এনআইডি",
        "মোবাইল নম্বর", "ইমেইল", "লিঙ্গ", "রক্তের গ্রুপ", "পদবী",
        "পেশা", "শিক্ষাগত যোগ্যতা", "সংগঠনের নাম", "ফেসবুক লিঙ্ক", "বাণী/মন্তব্য", "ছবি", "মেয়াদ শুরু", "মেয়াদ শেষ", "ঠিকানা", "তারিখ"
      ]);
    }

    var photoUrl = "";
    if (payload.photoData && typeof payload.photoData === 'string' && payload.photoData.trim() !== "") {
      if (payload.photoData.indexOf("http") === 0) {
        photoUrl = payload.photoData;
      } else {
        try {
          photoUrl = uploadToGoogleDrive(payload.photoData, (payload.name || "committee") + ".jpg");
        } catch(uploadErr) {
          photoUrl = "";
        }
      }
    }

    var formattedPhone = formatPhoneWithZero(payload.phone);
    var startDateBn = payload.startDate ? cleanDateFormat(new Date(payload.startDate)) : "-";
    var endDateBn = payload.endDate ? cleanDateFormat(new Date(payload.endDate)) : "-";

    sheet.appendRow([
      payload.type || "কার্যনির্বাহী কমিটি",
      payload.name || "",
      payload.fatherName || "",
      payload.motherName || "",
      payload.nid || "",
      formattedPhone,
      payload.email || "",
      payload.gender || "পুরুষ",
      payload.bloodGroup || "A+",
      payload.designation || "",
      payload.profession || "",
      payload.education || "",
      payload.org || "আউলিয়াপুর অগ্রযাত্রা পরিষদ",
      payload.fbLink || "",
      payload.message || "",
      photoUrl,
      startDateBn,
      endDateBn,
      payload.address || "",
      new Date()
    ]);

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || err.toString() };
  }
}

function submitExpenseRecord(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("আর্থিক_হিসাব");
    if (!sheet) return { success: false, error: "আর্থিক_হিসাব শীটটি পাওয়া যায়নি!" };
    
    var cleanDate = cleanDateFormat(new Date(payload.date));
    var amountBn = toBnDigits(payload.amount);
    
    sheet.appendRow([
      cleanDate,
      "ব্যয়",
      payload.sector,
      amountBn,
      payload.remarks,
      payload.approvedBy,
      payload.spentBy
    ]);
    return { success: true };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

function getExpenseLedger() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("আর্থিক_হিসাব");
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    var list = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var type = row[1] ? row[1].toString().trim() : "";
      if (type === "ব্যয়") {
        list.push({
          rowIdx: i + 1,
          date: row[0] ? cleanDateFormat(row[0]) : "",
          sector: row[2] ? row[2].toString().trim() : "",
          amount: row[3] ? row[3].toString().trim() : "০",
          remarks: row[4] ? row[4].toString().trim() : "",
          approvedBy: row[5] ? row[5].toString().trim() : "-",
          spentBy: row[6] ? row[6].toString().trim() : "-"
        });
      }
    }
    return list;
  } catch(e) {
    return [];
  }
}

function updateSheetRecord(tabName, rowIdx, updatedData) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      if (tabName === "সদস্য_তালিকা") sheet = ss.getSheetByName("সদস্য তথ্য ট্র্যাকার");
      if (tabName === "কমিটি_তালিকা") sheet = ss.getSheetByName("কমিটি_তালিকা");
    }
    if (!sheet) return { success: false, error: "শীট পাওয়া যায়নি!" };
    
    if (tabName === "সদস্য_তালিকা" || sheet.getName() === "সদস্য তথ্য ট্র্যাকার") {
      sheet.getRange(rowIdx, 2).setValue(updatedData.name); 
      sheet.getRange(rowIdx, 3).setValue(updatedData.fatherName); 
      sheet.getRange(rowIdx, 4).setValue(updatedData.designation); 
      sheet.getRange(rowIdx, 5).setValue(updatedData.address); 
      sheet.getRange(rowIdx, 6).setValue(formatPhoneWithZero(updatedData.phone)); 
      if (updatedData.joinDate) sheet.getRange(rowIdx, 7).setValue(updatedData.joinDate);
      sheet.getRange(rowIdx, 8).setValue(updatedData.nid); 
      sheet.getRange(rowIdx, 9).setValue(updatedData.profession); 
      sheet.getRange(rowIdx, 10).setValue(updatedData.bloodGroup); 
      sheet.getRange(rowIdx, 11).setValue(updatedData.email); 
      sheet.getRange(rowIdx, 12).setValue(updatedData.fbLink); 
      sheet.getRange(rowIdx, 13).setValue(updatedData.comments); 
      sheet.getRange(rowIdx, 14).setValue(toBnDigits(updatedData.monthlyFee)); 
      if (updatedData.photo && updatedData.photo.trim() !== "") sheet.getRange(rowIdx, 15).setValue(updatedData.photo);
      sheet.getRange(rowIdx, 16).setValue(updatedData.status);
      sheet.getRange(rowIdx, 17).setValue(updatedData.endDate);
      sheet.getRange(rowIdx, 18).setValue(updatedData.memberType);
      if (updatedData.motherName) sheet.getRange(rowIdx, 19).setValue(updatedData.motherName); 
      if (updatedData.gender) sheet.getRange(rowIdx, 20).setValue(updatedData.gender); 
      if (updatedData.education) sheet.getRange(rowIdx, 21).setValue(updatedData.education); 
    } 
    else if (tabName === "কমিটি_তালিকা") {
      sheet.getRange(rowIdx, 1).setValue(updatedData.type); 
      sheet.getRange(rowIdx, 2).setValue(updatedData.name); 
      sheet.getRange(rowIdx, 3).setValue(updatedData.fatherName || ""); 
      sheet.getRange(rowIdx, 4).setValue(updatedData.motherName || ""); 
      sheet.getRange(rowIdx, 5).setValue(updatedData.nid || ""); 
      sheet.getRange(rowIdx, 6).setValue(formatPhoneWithZero(updatedData.phone)); 
      sheet.getRange(rowIdx, 7).setValue(updatedData.email || ""); 
      sheet.getRange(rowIdx, 8).setValue(updatedData.gender || "পুরুষ"); 
      sheet.getRange(rowIdx, 9).setValue(updatedData.bloodGroup || "A+"); 
      sheet.getRange(rowIdx, 10).setValue(updatedData.designation); 
      sheet.getRange(rowIdx, 11).setValue(updatedData.profession); 
      sheet.getRange(rowIdx, 12).setValue(updatedData.education); 
      sheet.getRange(rowIdx, 13).setValue(updatedData.org); 
      sheet.getRange(rowIdx, 14).setValue(updatedData.fbLink); 
      sheet.getRange(rowIdx, 15).setValue(updatedData.message); 
      if (updatedData.photo && updatedData.photo.trim() !== "") sheet.getRange(rowIdx, 16).setValue(updatedData.photo);
      if (updatedData.startDate) sheet.getRange(rowIdx, 17).setValue(cleanDateFormat(new Date(updatedData.startDate)));
      if (updatedData.endDate) sheet.getRange(rowIdx, 18).setValue(cleanDateFormat(new Date(updatedData.endDate)));
      sheet.getRange(rowIdx, 19).setValue(updatedData.address || "");
    }
    else if (tabName === "আর্থিক_হিসাব") {
      sheet.getRange(rowIdx, 1).setValue(cleanDateFormat(new Date(updatedData.date)));
      sheet.getRange(rowIdx, 2).setValue(updatedData.type);
      sheet.getRange(rowIdx, 3).setValue(updatedData.sector);
      sheet.getRange(rowIdx, 4).setValue(toBnDigits(updatedData.amount));
      sheet.getRange(rowIdx, 5).setValue(updatedData.remarks);
    }
    else if (tabName === "প্রকল্প_ও_ত্রাণ") {
      sheet.getRange(rowIdx, 1).setValue(cleanDateFormat(new Date(updatedData.date)));
      sheet.getRange(rowIdx, 2).setValue(updatedData.title);
      sheet.getRange(rowIdx, 3).setValue(updatedData.sector);
      sheet.getRange(rowIdx, 4).setValue(toBnDigits(updatedData.amount));
      sheet.getRange(rowIdx, 5).setValue(updatedData.desc);
      sheet.getRange(rowIdx, 6).setValue(updatedData.status);
      sheet.getRange(rowIdx, 7).setValue(updatedData.location);
    }
    return { success: true };
  } catch (e) { return { success: false, error: e.toString() }; }
}

// ==========================================
// ৪. পেন্ডিং রিকুয়েস্ট রিডার (এডমিন প্যানেলের জন্য)
// ==========================================
function getPendingItems() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var response = { members: [], payments: [], blood: [] };
    
    var mSheet = ss.getSheetByName("সদস্য_তালিকা") || ss.getSheetByName("সদস্য তথ্য ট্র্যাকার");
    if (mSheet) {
      var mData = mSheet.getDataRange().getValues();
      for (var i = 1; i < mData.length; i++) {
        var row = mData[i];
        var id = row[0] ? row[0].toString().trim() : "";
        if (!id || id.toLowerCase() === "id" || id.indexOf("আইডি") !== -1) continue;
        
        var status = row[15] ? row[15].toString().trim() : "পেন্ডিং";
        if (status === "পেন্ডিং" || status === "আবেদনাধীন") {
          var phone = row[5] ? row[5].toString().trim() : "";
          if (phone.startsWith("'")) phone = phone.substring(1);
          response.members.push({ rowIdx: i + 1, memberId: id, name: row[1], phone: phone, desig: row[3], address: row[4] });
        }
      }
    }
    
    var pSheet = ss.getSheetByName("চাঁদা_পরিশোধ") || ss.getSheetByName("সদস্য চাঁদা ট্র্যাকার");
    if (pSheet) {
      var pData = pSheet.getDataRange().getValues();
      var headerRowIdx = findHeaderRow(pData);
      
      var idIdx = findColumnIndexByKeywords(pData[headerRowIdx], ["আইডি", "id", "নাম্বার"]);
      var pStatusIdx = findColumnIndexByKeywords(pData[headerRowIdx], ["অবস্থা", "status", "অনুমোদন"]);
      
      for (var i = headerRowIdx + 1; i < pData.length; i++) {
        var row = pData[i];
        var id = idIdx !== -1 && row[idIdx] ? row[idIdx].toString().trim() : ""; 
        if (!id) continue;
        
        var status = pStatusIdx !== -1 ? row[pStatusIdx].toString().trim() : "পেন্ডিং";
        if (status === "পেন্ডিং") {
          response.payments.push({ rowIdx: i + 1, date: cleanDateFormat(row[0]), memberId: id, month: row[3], amount: row[4], phone: row[5], method: row[6], txnId: row[7] });
        }
      }
    }
    
    var bSheet = ss.getSheetByName("রক্তদান_লগ") || ss.getSheetByName("রক্তদান কর্মসূচি ট্র্যাকার");
    if (bSheet) {
      var bData = bSheet.getDataRange().getValues();
      var headerRowIdx = findHeaderRow(bData);
      for (var i = headerRowIdx + 1; i < bData.length; i++) {
        var row = bData[i];
        var name = row[3] || row[2] || "";
        name = name.toString().trim();
        if (!name) continue;
        
        var status = row[15] ? row[15].toString().trim() : "পেন্ডিং"; 
        if (status === "পেন্ডিং") {
          response.blood.push({ 
            rowIdx: i + 1, 
            donorName: row[3] || row[2] || "অজানা দাতা", 
            donorPhone: row[6] || row[5] || "", 
            date: cleanDateFormat(row[7] || row[0]), 
            recipientName: row[9] || row[8] || "", 
            recipientPhone: row[10] || row[9] || "", 
            disease: row[12] || row[11] || "" 
          });
        }
      }
    }
    return response;
  } catch (e) { return { error: e.toString() }; }
}

// ==========================================
// ৫. সদস্য অনুমোদন ও রিজেক্ট ফাংশনসমূহ
// ==========================================
function approveMember(rowIdx) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("সদস্য_তালিকা") || ss.getSheetByName("সদস্য তথ্য ট্র্যাকার");
    if (!sheet) return { success: false, error: "সদস্য_তালিকা শিটটি পাওয়া যায়নি!" };
    
    rowIdx = parseInt(rowIdx, 10);
    if (isNaN(rowIdx) || rowIdx <= 1) return { success: false, error: "অবৈধ সারি নম্বর!" };

    sheet.getRange(rowIdx, 16).setValue("সক্রিয়"); 
    return { success: true };
  } catch (e) { 
    return { success: false, error: e.toString() }; 
  }
}

function approvePendingMember(rowIdx) {
  return approveMember(rowIdx);
}

function secureApproveMember(adminName, adminRole, rowIdx, memberName) {
  try {
    if (adminRole === "Viewer") return { success: false, error: "অনুমোদন করার অধিকার আপনার নেই।" };
    
    var result = approveMember(rowIdx);
    if (result && result.success) {
      try {
        logActivity(adminName || "Admin", "সদস্য অনুমোদন", "রো সূচক: " + rowIdx + " - '" + (memberName || "সদস্য") + "' কে সক্রিয় করা হয়েছে।");
      } catch (logErr) {
        Logger.log("Log Err: " + logErr.toString());
      }
    }
    return result;
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

function approvePayment(rowIdx, memberId, month, amount) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("চাঁদা_পরিশোধ") || ss.getSheetByName("সদস্য চাঁদা ট্র্যাকার");
    var cashSheet = ss.getSheetByName("আর্থিক_হিসাব");
    
    var data = sheet.getDataRange().getValues();
    var headerRowIdx = findHeaderRow(data);
    var pStatusIdx = findColumnIndexByKeywords(data[headerRowIdx], ["অবস্থা", "status", "অনুমোদন"]);
    var colNum = pStatusIdx !== -1 ? pStatusIdx + 1 : 9;
    
    sheet.getRange(rowIdx, colNum).setValue("অনুমোদিত");
    
    if (cashSheet) {
      var today = Utilities.formatDate(new Date(), "GMT+6", "dd-MM-yyyy");
      cashSheet.appendRow([ today, "আয়", "মাসিক চাঁদা (" + month + ") - ID: " + memberId, amount, "অনুমোদিত চাঁদা স্লিপ এন্ট্রি" ]);
    }
    return { success: true };
  } catch (e) { return { success: false, error: e.toString() }; }
}

function approvePendingPayment(rowIdx, memberId, month, amount) {
  return approvePayment(rowIdx, memberId, month, amount);
}

function approveBloodDonation(rowIdx, donorPhone, donorName, recipientPhone, recipientName) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("রক্তদান_লগ") || ss.getSheetByName("রক্তদান কর্মসূচি ট্র্যাকার");
    sheet.getRange(rowIdx, 16).setValue("অনুমোদিত"); 
    
    sendSmsNotification(donorPhone, "ধন্যবাদ! প্রিয় " + donorName + ", আপনার মহৎ রক্তদানের জন্য আউলিয়াপুর অগ্রযাত্রা পরিষদের পক্ষ থেকে জানাই লাল গোলাপ শুভেচ্ছা।");
    sendSmsNotification(recipientPhone, "মুমূর্ষু রোগীর রক্তের প্রয়োজনে আউলিয়াপুর অগ্রযাত্রা পরিষদ পাশে রয়েছে। রক্তগ্রহীতা " + recipientName + "-এর দ্রুত আরোগ্য কামনা করছি।");
    return { success: true };
  } catch (e) { return { success: false, error: e.toString() }; }
}

function approvePendingBlood(rowIdx, donorPhone, donorName, recipientPhone, recipientName) {
  return approveBloodDonation(rowIdx, donorPhone, donorName, recipientPhone, recipientName);
}

function deleteRowRecord(tabName, rowIdx) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var realTab = ss.getSheetByName(tabName);
    if (!realTab) {
      if (tabName === "সদস্য_তালিকা") realTab = ss.getSheetByName("সদস্য তথ্য ট্র্যাকার");
      if (tabName === "চাঁদা_পরিশোধ") realTab = ss.getSheetByName("সদস্য চাঁদা ট্র্যাকার");
      if (tabName === "রক্তদান_লগ") realTab = ss.getSheetByName("রক্তদান কর্মসূচি ট্র্যাকার");
    }
    if (!realTab) return { success: false, error: "শীট পাওয়া যায়নি!" };
    realTab.deleteRow(rowIdx);
    return { success: true };
  } catch (e) { return { success: false, error: e.toString() }; }
}

function rejectPendingItem(tabName, rowIdx) {
  return deleteRowRecord(tabName, rowIdx);
}

function secureApprovePayment(adminName, adminRole, rowIdx, memberId, month, amount) {
  if (adminRole === "Viewer") return { success: false, error: "অনুমোদন করার অধিকার আপনার নেই।" };
  var result = approvePayment(rowIdx, memberId, month, amount);
  if (result && result.success) {
    logActivity(adminName, "চাঁদা অনুমোদন", "সদস্য আইডি: " + memberId + " | মাস: " + month + " | পরিমাণ: ৳" + amount + " অনুমোদন করা হয়েছে।");
  }
  return result;
}

function secureApproveBloodDonation(adminName, adminRole, rowIdx, donorPhone, donorName, recipientPhone, recipientName) {
  if (adminRole === "Viewer") return { success: false, error: "রক্তদান কার্যক্রম অনুমোদন করার অধিকার আপনার নেই।" };
  var result = approveBloodDonation(rowIdx, donorPhone, donorName, recipientPhone, recipientName);
  if (result && result.success) {
    logActivity(adminName, "রক্তদান অনুমোদন", "দাতা: " + donorName + " -> গ্রহীতা: " + recipientName + " অনুমোদিত হয়েছে।");
  }
  return result;
}

function secureDeleteRowRecord(adminName, adminRole, tabName, rowIdx, recordInfo) {
  if (adminRole !== "Super Admin") return { success: false, error: "রেকর্ড ডিলিট করার অধিকার শুধুমাত্র 'Super Admin'-এর রয়েছে।" };
  var result = deleteRowRecord(tabName, rowIdx);
  if (result && result.success) {
    logActivity(adminName, "রেকর্ড ডিলেট", "'" + tabName + "' শীটের " + rowIdx + " নম্বর সারি (" + recordInfo + ") ডিলিট করা হয়েছে।");
  }
  return result;
}

function findHeaderRow(data) {
  if (!data || data.length === 0) return 0;
  for (var i = 0; i < data.length; i++) {
    var firstCell = data[i][0] ? data[i][0].toString().trim() : "";
    if (firstCell.toLowerCase() === "id" || firstCell.indexOf("আইডি") !== -1) {
      return i;
    }
  }
  return 0; 
}

function findColumnIndexByKeywords(headers, keywords) {
  if (!headers) return -1;
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i].toString().toLowerCase().trim();
    for (var j = 0; j < keywords.length; j++) {
      if (header.indexOf(keywords[j].toLowerCase()) !== -1) {
        return i;
      }
    }
  }
  return -1;
}

function sendSmsNotification(phone, message) {
  try {
    Logger.log("SMS to " + phone + ": " + message);
  } catch (e) {
    Logger.log("SMS Error: " + e.toString());
  }
}

function submitDonationPayment(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("চাঁদা_পরিশোধ") || ss.getSheetByName("সদস্য চাঁদা ট্র্যাকার");
    if (!sheet) return { success: false, error: "চাঁদা_পরিশোধ শীটটি পাওয়া যায়নি।" };
    
    var today = Utilities.formatDate(new Date(), "GMT+6", "dd-MM-yyyy");
    var memberId = payload.memberType === "সদস্য" ? payload.memberId.toString().trim() : "ডোনার/সাধারণ";
    var amountBn = toBnDigits(payload.amount);
    
    sheet.appendRow([
      today,               
      memberId,            
      payload.donorName,   
      payload.monthNote,   
      amountBn,            
      payload.phone,       
      payload.method,      
      payload.txnId,       
      "পেন্ডিং"             
    ]);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function getMemberInfoById(id) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("সদস্য_তালিকা") || ss.getSheetByName("সদস্য তথ্য ট্র্যাকার");
    if (!sheet) return { success: false, error: "সদস্য তালিকা পাওয়া যায়নি।" };
    var data = sheet.getDataRange().getValues();
    var headerIdx = findHeaderRow(data);
    for (var i = headerIdx + 1; i < data.length; i++) {
      var row = data[i];
      var memberId = row[0] ? row[0].toString().trim() : "";
      if (memberId.toLowerCase() === id.toLowerCase().trim()) {
        return {
          success: true,
          name: row[1] ? row[1].toString().trim() : "",
          fatherName: row[2] ? row[2].toString().trim() : "",
          phone: row[5] ? row[5].toString().trim() : "",
          bloodGroup: row[9] ? row[9].toString().trim() : ""
        };
      }
    }
    return { success: false, error: "সদস্য ডাটাবেজে পাওয়া যায়নি।" };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function submitBloodDonation(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("রক্তদান_লগ") || ss.getSheetByName("রক্তদান কর্মসূচি ট্র্যাকার");
    if (!sheet) return { success: false, error: "রক্তদান_লগ শীটটি পাওয়া যায়নি!" };
    
    var today = Utilities.formatDate(new Date(), "GMT+6", "dd-MM-yyyy");
    var donationDateBn = cleanDateFormat(new Date(payload.donationDate));
    var donorPhotoUrl = "";
    var recipientPhotoUrl = "";

    if (payload.donorPhotoData) donorPhotoUrl = uploadToGoogleDrive(payload.donorPhotoData, payload.donorName + "_donor.png");
    if (payload.recipientPhotoData) recipientPhotoUrl = uploadToGoogleDrive(payload.recipientPhotoData, payload.recipientName + "_recipient.png");
    
    sheet.appendRow([
      today,
      payload.donorType,
      payload.donorId || "",
      payload.donorName,
      payload.donorFather,
      payload.donorBlood,
      payload.donorPhone,
      donationDateBn,
      donorPhotoUrl,
      payload.recipientName,
      payload.recipientPhone,
      payload.recipientAddress,
      payload.recipientDisease,
      recipientPhotoUrl,
      payload.remarks,
      "পেন্ডিং"
    ]);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function submitDonorRegistration(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("রক্তদাতা_নিবন্ধন");
    if (!sheet) {
      sheet = ss.insertSheet("রক্তদাতা_নিবন্ধন");
      sheet.appendRow(["নিবন্ধন তারিখ", "নাম", "মোবাইল নম্বর", "লিঙ্গ", "জন্ম তারিখ", "রক্তের গ্রুপ", "শেষ রক্তদানের তারিখ", "ওজন (কেজি)", "বিভাগ", "জেলা", "উপজেলা", "ইউনিয়ন / গ্রাম", "ছবি", "অবস্থা", "ডোনারের ধরণ", "সদস্য আইডি"]);
    }
    
    var lastCol = sheet.getLastColumn();
    if (lastCol < 16) {
      sheet.getRange(1, 15).setValue("ডোনারের ধরণ");
      sheet.getRange(1, 16).setValue("সদস্য আইডি");
    }
    
    var today = Utilities.formatDate(new Date(), "GMT+6", "dd-MM-yyyy");
    var dobBn = payload.dob ? cleanDateFormat(new Date(payload.dob)) : "-";
    var lastDonationBn = payload.lastDonationDate ? cleanDateFormat(new Date(payload.lastDonationDate)) : "-";
    var memberId = payload.donorType === "সদস্য" ? payload.donorId.toString().trim() : "-";
    var donorPhotoUrl = "";

    if (payload.photoData) {
      donorPhotoUrl = uploadToGoogleDrive(payload.photoData, payload.name + "_donor_profile.png");
    }

    sheet.appendRow([
      today,                  
      payload.name,           
      payload.phone,          
      payload.gender,         
      dobBn,                  
      payload.bloodGroup,     
      lastDonationBn,         
      payload.weight,         
      payload.division,       
      payload.district,       
      payload.upazila,        
      payload.village,        
      donorPhotoUrl, 
      "সক্রিয়",               
      payload.donorType,      
      memberId                
    ]);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function getDonorList() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var list = [];
    var donorSheet = ss.getSheetByName("রক্তদাতা_নিবন্ধন");
    
    if (donorSheet) {
      var dData = donorSheet.getDataRange().getValues();
      if (dData.length > 1) {
        var headers = dData[0].map(function(h) { return h ? h.toString().trim() : ""; });
        
        var nameIdx = findColumnIndexByKeywords(headers, ["নাম", "name"]);
        var typeIdx = findColumnIndexByKeywords(headers, ["ধরণ", "type"]);
        var idIdx = findColumnIndexByKeywords(headers, ["আইডি", "id"]);
        var phoneIdx = findColumnIndexByKeywords(headers, ["মোবাইল", "phone", "নম্বর"]);
        var bloodIdx = findColumnIndexByKeywords(headers, ["রক্তের গ্রুপ", "blood", "group"]);
        var lastDonationIdx = findColumnIndexByKeywords(headers, ["শেষ রক্তদান", "last"]);
        var upazilaIdx = findColumnIndexByKeywords(headers, ["উপজেলা", "upazila"]);
        var districtIdx = findColumnIndexByKeywords(headers, ["জেলা", "district"]);
        var statusIdx = findColumnIndexByKeywords(headers, ["অবস্থা", "status"]);
        
        if (nameIdx === -1) nameIdx = 1;      
        if (phoneIdx === -1) phoneIdx = 2;    
        if (bloodIdx === -1) bloodIdx = 5;    
        if (lastDonationIdx === -1) lastDonationIdx = 6; 
        if (upazilaIdx === -1) upazilaIdx = 10; 
        if (districtIdx === -1) districtIdx = 9; 
        if (statusIdx === -1) statusIdx = 13;   
        if (typeIdx === -1) typeIdx = 14;     
        if (idIdx === -1) idIdx = 15;         

        for (var i = 1; i < dData.length; i++) {
          var row = dData[i];
          if (!row || row.length === 0) continue;
          
          var dStatus = (statusIdx < row.length && row[statusIdx]) ? row[statusIdx].toString().trim() : "সক্রিয়";
          if (dStatus !== "সক্রিয়") continue;

          var blood = (bloodIdx < row.length && row[bloodIdx]) ? row[bloodIdx].toString().trim() : "";
          blood = blood.replace(/\s+/g, '').toUpperCase();
          
          if (blood) {
            var dName = (nameIdx < row.length && row[nameIdx]) ? row[nameIdx].toString().trim() : "রক্তদাতা";
            var dPhone = (phoneIdx < row.length && row[phoneIdx]) ? row[phoneIdx].toString().trim() : "N/A";
            
            var upazila = (upazilaIdx < row.length && row[upazilaIdx]) ? row[upazilaIdx].toString().trim() : "";
            var district = (districtIdx < row.length && row[districtIdx]) ? row[districtIdx].toString().trim() : "";
            var locationStr = upazila && district ? upazila + ", " + district : (upazila || district || "আউলিয়াপুর");
            
            var dType = (typeIdx < row.length && row[typeIdx]) ? row[typeIdx].toString().trim() : "সাধারণ ডোনার";
            var memberId = (idIdx < row.length && row[idIdx]) ? row[idIdx].toString().trim() : "-";
            
            var lastDonationVal = (lastDonationIdx < row.length && row[lastDonationIdx]) ? row[lastDonationIdx] : "-";
            var cleanDateStr = cleanDateFormat(lastDonationVal);

            list.push({
              name: dName,
              bloodGroup: blood,
              phone: dPhone,
              location: locationStr,
              type: dType,
              memberId: memberId,
              lastDonation: cleanDateStr
            });
          }
        }
      }
    }
    
    return list;
  } catch (e) {
    return [];
  }
}

function getAuliyapurHomeData() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var result = {
      summary: { totalPlanted: "০", totalMembers: "০", totalDonations: "০" },
      recentActivities: [],
      upcomingProjects: [],
      advisor: { name: "তথ্য নেই", designation: "প্রধান উপদেষ্টা", phone: "-", org: "আউলিয়াপুর অগ্রযাত্রা পরিষদ", fbLink: "#", message: "মানবসেবাই আমাদের লক্ষ্য।", photo: "" },
      president: { name: "তথ্য নেই", fbLink: "#", message: "অদম্য ইচ্ছাশক্তিই অগ্রযাত্রার মূল ভিত্তি।", photo: "" },
      secretary: { name: "তথ্য নেই", fbLink: "#", message: "আমরা তরুণরাই আনবো পরিবর্তন।", photo: "" },
      donors: []
    };

    var mSheet = ss.getSheetByName("সদস্য_তালিকা") || ss.getSheetByName("সদস্য তথ্য ট্র্যাকার");
    if (mSheet) {
      var mData = mSheet.getDataRange().getValues();
      var mHeader = findHeaderRow(mData);
      var mCount = 0;
      for (var i = mHeader + 1; i < mData.length; i++) {
        var status = mData[i][15] ? mData[i][15].toString().trim() : "সক্রিয়";
        if (status === "সক্রিয়") mCount++;
      }
      result.summary.totalMembers = toBnDigits(mCount) + " জন";
    }

    var bSheet = ss.getSheetByName("রক্তদান_লগ") || ss.getSheetByName("রক্তদান কর্মসূচি ট্র্যাকার");
    if (bSheet) {
      var bData = bSheet.getDataRange().getValues();
      var bCount = 0;
      for (var i = 1; i < bData.length; i++) {
        var status = bData[i][15] ? bData[i][15].toString().trim() : "পেন্ডিং";
        if (status === "অনুমোদিত" || status === "সক্রিয়") bCount++;
      }
      result.summary.totalDonations = toBnDigits(bCount) + " বার";
    }

    var projSheet = ss.getSheetByName("প্রকল্প_ও_ত্রাণ");
    var totalPlantedCount = 500; 
    if (projSheet) {
      var pData = projSheet.getDataRange().getValues();
      for (var i = 1; i < pData.length; i++) {
        var sector = pData[i][2] ? pData[i][2].toString().trim() : ""; 
        var countVal = parseFloat(toEnDigits(pData[i][3])) || 0; 
        if (sector.includes("রোপণ") || sector.includes("গাছ") || sector.includes("বৃক্ষ")) {
          totalPlantedCount += countVal > 0 ? countVal : 1; 
        }

        if (result.recentActivities.length < 3 && pData[i][1]) { 
          result.recentActivities.push({
            date: pData[i][0] ? cleanDateFormat(pData[i][0]) : "-",
            title: pData[i][1].toString().trim(),
            desc: pData[i][4] ? pData[i][4].toString().trim() : "অসহায় ও সুবিধা বঞ্চিত মানুষের সেবায় আমরা নিয়োজিত আছি।"
          });
        }
      }
    }
    result.summary.totalPlanted = toBnDigits(totalPlantedCount) + "+ টি";

    if (result.recentActivities.length === 0) {
      result.recentActivities = [
        { date: "১২-০৭-২০২৬", title: "বৃক্ষরোপণ কর্মসূচি ২০২৬", desc: "পরিবেশ রক্ষায় ও সবুজ পটুয়াখালী গড়ার লক্ষে অগ্রযাত্রা পরিষদের পক্ষ থেকে পটুয়াখালী জেলাজুড়ে চারাগাছ রোপণ।" },
        { date: "০৫-০৭-২০২৬", title: "শিক্ষা সামগ্রী বিতরণ প্রজেক্ট", desc: "দরিদ্র ও সুবিধাবঞ্চিত শিক্ষার্থীদের মাঝে অগ্রযাত্রা পরিষদের পক্ষ থেকে বিনামূল্যে বই, খাতা ও কলম বিতরণ।" },
        { date: "০১-০৬-২০২৬", title: "শীতবস্ত্র বিতরণ কর্মসূচি", desc: "তীব্র শীতে অসহায় ও দুস্থ শীতার্তদের উষ্ণতা দিতে অগ্রযাত্রা পরিষদের কম্বল ও শীতবস্ত্র বিতরণ প্রজেক্ট।" }
      ];
    }

    result.upcomingProjects = [
      { day: "২৫", month: "JUL", title: "বিনামূল্যে রক্ত পরীক্ষা ক্যাম্প", location: "আউলিয়াপুর ইউনিয়ন পরিষদ" },
      { day: "১০", month: "AUG", title: "মেধাবী ছাত্র বৃত্তি প্রদান", location: "আউলিয়াপুর আদর্শ স্কুল" },
      { day: "১৫", month: "SEP", title: "অগ্রযাত্রা বর্ষপূর্তি ২০২৬", location: "অগ্রযাত্রা পরিষদ কার্যালয়" }
    ];

    var commSheet = ss.getSheetByName("কমিটি_তালিকা");
    if (commSheet) {
      var cData = commSheet.getDataRange().getValues();
      for (var i = 1; i < cData.length; i++) {
        var type = cData[i][0] ? cData[i][0].toString().trim() : "";
        var name = cData[i][1] ? cData[i][1].toString().trim() : "";
        var phone = cData[i][5] || cData[i][2] || "";
        phone = phone.toString().trim();
        var desig = cData[i][9] || cData[i][3] || "";
        desig = desig.toString().trim();
        var org = cData[i][12] || cData[i][4] || "আউলিয়াপুর অগ্রযাত্রা পরিষদ";
        org = org.toString().trim();
        var photo = cData[i][15] || cData[i][5] || "";
        photo = photo.toString().trim();
        var fbLink = cData[i][13] || cData[i][6] || "#";
        fbLink = fbLink.toString().trim();
        var msg = cData[i][14] || cData[i][7] || "";
        msg = msg.toString().trim();

        if (type === "উপদেষ্টা মণ্ডলী" && desig.includes("প্রধান")) {
          result.advisor = { name: name, designation: desig, phone: phone, org: org, fbLink: fbLink, message: msg || "মানবসেবাই আমাদের লক্ষ্য।", photo: photo };
        }
        if (desig.includes("সভাপতি") && type.includes("কমিটি")) {
          result.president = { name: name, fbLink: fbLink, message: msg || "অদম্য ইচ্ছাশক্তিই অগ্রযাত্রার মূল ভিত্তি।", photo: photo };
        }
        if (desig.includes("সম্পাদক") && type.includes("কমিটি")) {
          result.secretary = { name: name, fbLink: fbLink, message: msg || "আমরা তরুণরাই আনবো পরিবর্তন।", photo: photo };
        }
        if (type === "ডোনার ও পার্টনার" && result.donors.length < 3) {
          result.donors.push({ name: name, designation: desig, org: org, phone: phone, photo: photo });
        }
      }
    }

    return result;
  } catch (e) {
    return { error: e.toString() };
  }
} 

function getLiveProjectStats(projectName) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("প্রকল্প_ও_ত্রাণ");
    var totalAmount = 0;
    var totalEntries = 0;
    var timelines = [];
    
    if (sheet) {
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var date = row[0] ? cleanDateFormat(row[0]) : "";
        var title = row[1] ? row[1].toString().trim() : "";
        var sector = row[2] ? row[2].toString().trim() : "";
        var amount = parseFloat(toEnDigits(row[3])) || 0;
        
        if (sector.toLowerCase() === projectName.toLowerCase().trim() || title.toLowerCase().includes(projectName.toLowerCase().trim())) {
          totalAmount += amount;
          totalEntries++;
          
          var year = date.split("-")[2];
          if (year && timelines.length < 4) {
            timelines.push({ year: toBnDigits(year), text: title + " — " + (row[6] ? row[6].toString().trim() : "আউলিয়াপুর") });
          }
        }
      }
    }
    return {
      success: true,
      totalAmount: toBnDigits(totalAmount),
      totalEntries: toBnDigits(totalEntries),
      timelines: timelines
    };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

function submitProjectCampaign(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("প্রকল্প_ও_ত্রাণ");
    if (!sheet) return { success: false, error: "প্রকল্প_ও_ত্রাণ শীটটি পাওয়া যায়নি।" };
    
    var today = Utilities.formatDate(new Date(), "GMT+6", "dd-MM-yyyy");
    var cleanDate = payload.date ? cleanDateFormat(new Date(payload.date)) : today;
    var amountBn = toBnDigits(payload.amount);
    
    sheet.appendRow([
      cleanDate,
      payload.title,
      payload.sector,
      amountBn,
      payload.desc,
      payload.status,
      payload.location
    ]);
    return { success: true };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

function sendBulkSmsAndEmail(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var target = payload.target;
    var sendSms = payload.sendSms;
    var sendEmail = payload.sendEmail;
    var subject = payload.subject;
    var message = payload.message;
    
    var contacts = []; 
    
    if (target === "members" || target === "all") {
      var mSheet = ss.getSheetByName("সদস্য_তালিকা") || ss.getSheetByName("সদস্য তথ্য ট্র্যাকার");
      if (mSheet) {
        var mData = mSheet.getDataRange().getValues();
        var mHeader = findHeaderRow(mData);
        for (var i = mHeader + 1; i < mData.length; i++) {
          var status = mData[i][15] ? mData[i][15].toString().trim() : "সক্রিয়";
          if (status === "সক্রিয়") {
            contacts.push({
              name: mData[i][1] ? mData[i][1].toString().trim() : "সদস্য",
              phone: mData[i][5] ? mData[i][5].toString().trim() : "",
              email: mData[i][10] ? mData[i][10].toString().trim() : ""
            });
          }
        }
      }
    }
    
    if (target === "executives" || target === "advisors" || target === "donors" || target === "all") {
      var cSheet = ss.getSheetByName("কমিটি_তালিকা");
      if (cSheet) {
        var cData = cSheet.getDataRange().getValues();
        for (var i = 1; i < cData.length; i++) {
          var type = cData[i][0] ? cData[i][0].toString().trim() : "";
          var name = cData[i][1] ? cData[i][1].toString().trim() : "";
          var phone = cData[i][5] || cData[i][2] || "";
          phone = phone.toString().trim();
          
          var match = false;
          if (target === "all") match = true;
          else if (target === "executives" && type === "কার্যনির্বাহী কমিটি") match = true;
          else if (target === "advisors" && type === "উপদেষ্টা মণ্ডলী") match = true;
          else if (target === "donors" && type === "ডোনার ও পার্টনার") match = true;
          
          if (match && phone) {
            contacts.push({ name: name, phone: phone, email: "" });
          }
        }
      }
    }
    
    if (target === "blood_donors" || target === "all") {
      var dSheet = ss.getSheetByName("রক্তদাতা_নিবন্ধন");
      if (dSheet) {
        var dData = dSheet.getDataRange().getValues();
        for (var i = 1; i < dData.length; i++) {
          var name = dData[i][1] ? dData[i][1].toString().trim() : "";
          var phone = dData[i][2] ? dData[i][2].toString().trim() : "";
          var status = dData[i][13] ? dData[i][13].toString().trim() : "সক্রিয়";
          
          if (status === "সক্রিয়" && phone) {
            contacts.push({ name: name, phone: phone, email: "" });
          }
        }
      }
    }
    
    var smsCount = 0;
    var emailCount = 0;
    
    for (var i = 0; i < contacts.length; i++) {
      var c = contacts[i];
      if (sendSms && c.phone) {
        var cleanedPhone = toEnDigits(c.phone);
        sendSmsNotificationLive(cleanedPhone, message);
        smsCount++;
      }
      if (sendEmail && c.email && c.email.indexOf("@") !== -1) {
        var emailBody = "প্রিয় " + c.name + ",\n\n" + message + "\n\nধন্যবাদান্তে,\nআউলিয়াপুর অগ্রযাত্রা পরিষদ";
        MailApp.sendEmail(c.email, subject, emailBody);
        emailCount++;
      }
    }
    
    return {
      success: true,
      totalTargets: contacts.length,
      smsSent: smsCount,
      emailSent: emailCount
    };
    
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function sendSmsNotificationLive(phone, message) {
  try {
    Logger.log("SMS Broadcast Sent to " + phone + ": " + message);
  } catch (e) {
    Logger.log("Live SMS Error: " + e.toString());
  }
}

function logActivity(adminName, action, details) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = ss.getSheetByName("অ্যাক্টিভিটি_লগ");
    if (!logSheet) {
      logSheet = ss.insertSheet("অ্যাক্টিভিটি_লগ");
      logSheet.appendRow(["তারিখ ও সময়", "অ্যাডমিনের নাম", "কার্যক্রম/অ্যাকশন", "বিস্তারিত বিবরণ"]);
      logSheet.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#e6f2ff");
    }
    var timestamp = Utilities.formatDate(new Date(), "GMT+6", "dd-MM-yyyy HH:mm:ss");
    logSheet.appendRow([timestamp, adminName || "অ্যাডমিন", action || "কার্যক্রম", details || ""]);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function checkAdminLoginSecure(username, password) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var adminSheet = ss.getSheetByName("অ্যাডমিন_তালিকা");
    if (!adminSheet) {
      adminSheet = ss.insertSheet("অ্যাডমিন_তালিকা");
      adminSheet.appendRow(["ইউজারনেম", "পাসওয়ার্ড/পিন", "নাম", "রোল", "অবস্থা"]);
      adminSheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#fff2cc");
      adminSheet.appendRow(["superadmin", "AAP2026", "প্রধান প্রশাসক", "Super Admin", "সক্রিয়"]);
    }
    
    var data = adminSheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var sheetUser = data[i][0].toString().trim();
      var sheetPass = data[i][1].toString().trim();
      var name = data[i][2].toString().trim();
      var role = data[i][3].toString().trim();
      var status = data[i][4].toString().trim();
      
      if (sheetUser === username.trim() && sheetPass === password.trim()) {
        if (status !== "সক্রিয়") {
          return { success: false, message: "দুঃখিত, এই অ্যাডমিন অ্যাকাউন্টটি সাময়িকভাবে বন্ধ আছে।" };
        }
        logActivity(name, "লগইন", "সিস্টেমে অ্যাডমিন হিসেবে প্রবেশ করেছেন। রোল: " + role);
        return { success: true, name: name, role: role, username: sheetUser };
      }
    }
    return { success: false, message: "ভুল ইউজারনেম অথবা পাসওয়ার্ড/পিন!" };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function addNewAdminUser(currentAdminUser, currentAdminRole, newUsername, newPassword, newName, newRole) {
  try {
    if (currentAdminRole !== "Super Admin") {
      return { success: false, message: "নতুন অ্যাডমিন যুক্ত করার অনুমতি শুধুমাত্র 'Super Admin'-এর রয়েছে।" };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var adminSheet = ss.getSheetByName("অ্যাডমিন_তালিকা");
    if (!adminSheet) return { success: false, message: "অ্যাডমিন_তালিকা শীটটি পাওয়া যায়নি!" };
    
    var data = adminSheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0].toString().trim().toLowerCase() === newUsername.trim().toLowerCase()) {
        return { success: false, message: "এই ইউজারনেম দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে।" };
      }
    }
    
    adminSheet.appendRow([newUsername.trim(), newPassword.trim(), newName.trim(), newRole.trim(), "সক্রিয়"]);
    logActivity(currentAdminUser, "অ্যাডমিন সৃষ্টি", "নতুন অ্যাডমিন '" + newName + "' (রোল: " + newRole + ") যুক্ত করেছেন।");
    return { success: true, message: "সফলভাবে নতুন অ্যাডমিন তৈরি হয়েছে।" };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function sendCategorizedBulkNotification(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var adminName = payload.adminName || "অজানা প্রশাসক";
    var adminRole = payload.adminRole || "Viewer";
    var category = payload.category; 
    var sendSms = payload.sendSms;
    var sendEmail = payload.sendEmail;
    var subject = payload.subject || "আউলিয়াপুর অগ্রযাত্রা পরিষদ";
    var message = payload.message;
    
    if (adminRole === "Viewer") {
      return { success: false, message: "দুঃখিত, নোটিফিকেশন ব্রডকাস্ট করার অনুমতি আপনার নেই।" };
    }
    
    var contacts = []; 
    var mSheet = ss.getSheetByName("সদস্য_তালিকা") || ss.getSheetByName("সদস্য তথ্য ট্র্যাকার");
    var mData = mSheet ? mSheet.getDataRange().getValues() : [];
    var mHeaderIdx = findHeaderRow(mData);
    
    var cSheet = ss.getSheetByName("কমিটি_তালিকা");
    var cData = cSheet ? cSheet.getDataRange().getValues() : [];
    
    if (category === "all") {
      if (mData.length > 1) {
        for (var i = mHeaderIdx + 1; i < mData.length; i++) {
          var status = mData[i][15] ? mData[i][15].toString().trim() : "সক্রিয়";
          if (status === "সক্রিয়") {
            contacts.push({ name: mData[i][1], phone: mData[i][5], email: mData[i][10] });
          }
        }
      }
      if (cData.length > 1) {
        for (var i = 1; i < cData.length; i++) {
          var phone = cData[i][5] || cData[i][2] || "";
          phone = phone.toString().trim();
          if (phone) contacts.push({ name: cData[i][1], phone: phone, email: "" });
        }
      }
    } else if (category === "executive") {
      if (cData.length > 1) {
        for (var i = 1; i < cData.length; i++) {
          var type = cData[i][0] ? cData[i][0].toString().trim() : "";
          var phone = cData[i][5] || cData[i][2] || "";
          phone = phone.toString().trim();
          if (type === "কার্যনির্বাহী কমিটি" && phone) {
            contacts.push({ name: cData[i][1], phone: phone, email: "" });
          }
        }
      }
    }
    
    var finalSmsCount = 0;
    var finalEmailCount = 0;
    
    for (var i = 0; i < contacts.length; i++) {
      var item = contacts[i];
      var finalMessage = message.replace(/{Name}/g, item.name);
      
      if (sendSms && item.phone) {
        sendSmsNotificationLive(toEnDigits(item.phone), finalMessage);
        finalSmsCount++;
      }
      if (sendEmail && item.email && item.email.indexOf("@") !== -1) {
        var emailBodyHtml = "প্রিয় <b>" + item.name + "</b>,<br><br>" + finalMessage.replace(/\n/g, '<br>') + "<br><br>ধন্যবাদান্তে,<br><b>আউলিয়াপুর অগ্রযাত্রা পরিষদ</b>";
        MailApp.sendEmail({ to: item.email, subject: subject, htmlBody: emailBodyHtml });
        finalEmailCount++;
      }
    }
    
    logActivity(adminName, "গ্রুপ নোটিফিকেশন ব্রডকাস্ট", "প্রেরিত এসএমএস: " + finalSmsCount + "টি | ইমেইল: " + finalEmailCount + "টি");
    return { success: true, totalCount: contacts.length, smsCount: finalSmsCount, emailCount: finalEmailCount };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function saveMediaContent(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet;
    var rowData = [];
    var timestamp = new Date();
    
    if (payload.type === "photo") {
      var isNew = !ss.getSheetByName("Photos");
      sheet = ss.getSheetByName("Photos") || ss.insertSheet("Photos");
      if (isNew || sheet.getLastRow() === 0) {
        sheet.appendRow(["Title", "Image URL", "Category", "Description", "Date", "Timestamp"]);
      }
      rowData = [payload.title, payload.photoUrl, payload.photoCategory, payload.photoDescription, payload.photoDate, timestamp];
      
    } else if (payload.type === "video") {
      var isNew = !ss.getSheetByName("Videos");
      sheet = ss.getSheetByName("Videos") || ss.insertSheet("Videos");
      if (isNew || sheet.getLastRow() === 0) {
        sheet.appendRow(["Title", "Video URL", "Duration", "Timestamp"]);
      }
      rowData = [payload.title, payload.videoUrl, payload.videoDuration, timestamp];
      
    } else if (payload.type === "news") {
      var isNew = !ss.getSheetByName("News");
      sheet = ss.getSheetByName("News") || ss.insertSheet("News");
      if (isNew || sheet.getLastRow() === 0) {
        sheet.appendRow(["Title", "Content", "Date", "PDF URL", "Timestamp"]);
      }
      rowData = [payload.title, payload.newsContent, payload.newsDate, payload.newsPdfUrl, timestamp];
      
    } else if (payload.type === "press") {
      var isNew = !ss.getSheetByName("Press");
      sheet = ss.getSheetByName("Press") || ss.insertSheet("Press");
      if (isNew || sheet.getLastRow() === 0) {
        sheet.appendRow(["Title", "Image URL", "Source", "Date", "Excerpt", "News URL", "Timestamp"]);
      }
      rowData = [payload.title, payload.pressImageUrl, payload.pressSource, payload.pressDate, payload.pressExcerpt, payload.pressNewsUrl, timestamp];
      
    } else if (payload.type === "award") {
      var isNew = !ss.getSheetByName("Awards");
      sheet = ss.getSheetByName("Awards") || ss.insertSheet("Awards");
      if (isNew || sheet.getLastRow() === 0) {
        sheet.appendRow(["Title", "Image URL", "Authority", "Year", "Description", "Timestamp"]);
      }
      rowData = [payload.title, payload.awardImageUrl, payload.awardAuthority, payload.awardYear, payload.awardDescription, timestamp];
    }
    
    if (sheet) {
      sheet.appendRow(rowData);
      return { status: "success", message: "সফলভাবে শিটে সংরক্ষণ করা হয়েছে।" };
    }
    return { status: "error", message: "শিট পাওয়া যায়নি।" };
  } catch (error) {
    return { status: "error", message: error.toString() };
  }
}

function getPhotoGalleryData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Photos");
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    result.push({
      title: data[i][0] ? data[i][0].toString() : "",
      url: data[i][1] ? data[i][1].toString() : "",
      category: data[i][2] ? data[i][2].toString() : "",
      description: data[i][3] ? data[i][3].toString() : "",
      date: data[i][4] ? data[i][4].toString() : ""
    });
  }
  return result;
}

function getVideoGalleryData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Videos");
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    result.push({
      title: data[i][0] ? data[i][0].toString() : "",
      videoUrl: data[i][1] ? data[i][1].toString() : "",
      duration: data[i][2] ? data[i][2].toString() : ""
    });
  }
  return result;
}

function getNoticeBoardData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("News");
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    result.push({
      title: data[i][0] ? data[i][0].toString() : "",
      content: data[i][1] ? data[i][1].toString() : "",
      date: data[i][2] ? data[i][2].toString() : "",
      pdfUrl: data[i][3] ? data[i][3].toString() : ""
    });
  }
  return result;
}

function getPressReleaseData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Press");
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    result.push({
      title: data[i][0] ? data[i][0].toString() : "",
      imageUrl: data[i][1] ? data[i][1].toString() : "",
      source: data[i][2] ? data[i][2].toString() : "",
      date: data[i][3] ? data[i][3].toString() : "",
      excerpt: data[i][4] ? data[i][4].toString() : "",
      newsUrl: data[i][5] ? data[i][5].toString() : ""
    });
  }
  return result;
}

function getAwardsData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Awards");
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    result.push({
      title: data[i][0] ? data[i][0].toString() : "",
      imageUrl: data[i][1] ? data[i][1].toString() : "",
      authority: data[i][2] ? data[i][2].toString() : "",
      year: data[i][3] ? data[i][3].toString() : "",
      description: data[i][4] ? data[i][4].toString() : ""
    });
  }
  return result;
}

function submitMemberPayment(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("চাঁদা_পরিশোধ") || ss.getSheetByName("সদস্য চাঁদা ট্র্যাকার");
    if (!sheet) return { success: false, error: "চাঁদা_পরিশোধ শীটটি পাওয়া যায়নি।" };
    
    var today = Utilities.formatDate(new Date(), "GMT+6", "dd-MM-yyyy");
    var memberId = payload.memberId ? payload.memberId.toString().trim() : "ডোনার/সাধারণ";
    var amountBn = toBnDigits(payload.amount);
    
    sheet.appendRow([
      today,                  
      memberId,               
      payload.name || "",     
      payload.month || "",    
      amountBn,               
      payload.phone || "",    
      payload.method || "",   
      payload.txnId || "",    
      "পেন্ডিং"                
    ]);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function getBloodDonationList() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var bloodSheet = ss.getSheetByName("রক্তদান_লগ") || ss.getSheetByName("রক্তদান কর্মসূচি ট্র্যাকার");
    var donorSheet = ss.getSheetByName("রক্তদাতা_নিবন্ধন");
    
    var list = [];
    var stats = {
      totalDonations: 0,
      totalRegisteredDonors: 0,
      uniqueDonorsCount: 0,
      groupStats: { "A+": 0, "A-": 0, "B+": 0, "B-": 0, "AB+": 0, "AB-": 0, "O+": 0, "O-": 0 }
    };

    if (donorSheet) {
      var dData = donorSheet.getDataRange().getValues();
      if (dData.length > 1) {
        stats.totalRegisteredDonors = dData.length - 1; 
      }
    }

    if (bloodSheet) {
      var data = bloodSheet.getDataRange().getValues();
      if (data.length > 1) {
        var bHeaders = data[0].map(function(h) { return h.toString().trim(); });
        var bStatusIdx = findColumnIndexByKeywords(bHeaders, ["অবস্থা", "status"]); 
        var bGrpIdx = findColumnIndexByKeywords(bHeaders, ["গ্রুপ", "blood", "group"]); 
        var bIdIdx = findColumnIndexByKeywords(bHeaders, ["আইডি", "id"]); 
        var bNameIdx = findColumnIndexByKeywords(bHeaders, ["নাম", "name"]); 
        
        var uniqueDonorsSet = {};
        var donorDonationCountMap = {}; 

        for (var i = 1; i < data.length; i++) {
          var row = data[i];
          var status = bStatusIdx !== -1 ? row[bStatusIdx].toString().trim() : "পেন্ডিং";
          
          if (status === "অনুমোদিত" || status === "সক্রিয়") {
            var donorKey = "";
            if (bIdIdx !== -1 && row[bIdIdx]) donorKey = row[bIdIdx].toString().trim();
            if (!donorKey && bNameIdx !== -1) donorKey = row[bNameIdx].toString().trim();
            if (donorKey) {
              donorDonationCountMap[donorKey] = (donorDonationCountMap[donorKey] || 0) + 1;
            }
          }
        }

        for (var i = 1; i < data.length; i++) {
          var row = data[i];
          var status = bStatusIdx !== -1 ? row[bStatusIdx].toString().trim() : "পেন্ডিং";
          
          if (status === "অনুমোদিত" || status === "সক্রিয়") {
            stats.totalDonations++; 
            
            var bloodGrp = bGrpIdx !== -1 ? row[bGrpIdx].toString().trim().replace(/\s+/g, '').toUpperCase() : "N/A";
            if (stats.groupStats[bloodGrp] !== undefined) {
              stats.groupStats[bloodGrp]++;
            }
            
            var donorKey = "";
            if (bIdIdx !== -1 && row[bIdIdx]) donorKey = row[bIdIdx].toString().trim();
            if (!donorKey && bNameIdx !== -1) donorKey = row[bNameIdx].toString().trim();
            
            if (donorKey) {
              uniqueDonorsSet[donorKey] = true;
            }

            var personalBloodCount = donorDonationCountMap[donorKey] || 1;

            list.push({
              date: row[0] ? cleanDateFormat(row[0]) : "",
              donorType: row[1] ? row[1].toString().trim() : "সাধারণ",
              donorId: row[2] ? row[2].toString().trim() : "-",
              donorName: row[3] ? row[3].toString().trim() : "অজানা দাতা",
              donorFather: row[4] ? row[4].toString().trim() : "-",
              donorBlood: bloodGrp,
              donorPhone: row[6] ? row[6].toString().trim() : "N/A",
              donationDate: row[7] ? cleanDateFormat(row[7]) : "",
              donorPhoto: row[8] ? row[8].toString().trim() : "",
              recipientName: row[9] ? row[9].toString().trim() : "অজানা গ্রহীতা",
              recipientPhone: row[10] ? row[10].toString().trim() : "N/A",
              recipientAddress: row[11] ? row[11].toString().trim() : "N/A",
              recipientDisease: row[12] ? row[12].toString().trim() : "N/A",
              recipientPhoto: row[13] ? row[13].toString().trim() : "",
              remarks: row[14] ? row[14].toString().trim() : "",
              donorBloodCount: toBnDigits(personalBloodCount) 
            });
          }
        }
        stats.uniqueDonorsCount = Object.keys(uniqueDonorsSet).length;
      }
    }

    stats.totalDonations = toBnDigits(stats.totalDonations);
    stats.totalRegisteredDonors = toBnDigits(stats.totalRegisteredDonors);
    stats.uniqueDonorsCount = toBnDigits(stats.uniqueDonorsCount);
    for (var grp in stats.groupStats) {
      stats.groupStats[grp] = toBnDigits(stats.groupStats[grp]);
    }

    return {
      list: list.reverse(),
      stats: stats
    };
  } catch (e) {
    return { error: e.toString() };
  }
}

function parseMoney(val) {
  if (val === undefined || val === null || val === "") return 0;
  var str = val.toString().trim();
  
  var enDigits = { "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9" };
  str = str.replace(/[০-৯]/g, function(w) { return enDigits[w]; });
  
  str = str.replace(/[^0-9.-]/g, "");
  var num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function triggerEmailAuth() {
  MailApp.sendEmail("test@example.com", "Auth Test", "Authorization Trigger");
}