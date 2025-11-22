import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";
import { saveAs } from "file-saver";
import All_counties from "./counties.json";
import * as XLSX from "xlsx";
import moment from "moment";
import Papa from "papaparse";
import * as yup from "yup";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const downloadCsv = (data, filename = "data.csv") => {
  // Convert the array of objects to CSV text
  const csv = Papa.unparse(data);

  // Create a Blob from the CSV
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  // Trigger file download
  saveAs(blob, filename);
};

export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const getNonNullValue = (value) => {
  if (value != "") {
    return value;
  } else {
    return undefined;
  }
};

export function filterEmptyFields(object) {
  Object.keys(object).forEach((key) => {
    if (empty(object[key])) {
      delete object[key];
    }
  });
  return object;
}

export function empty(value) {
  return (
    value === "" ||
    value === null ||
    value === undefined ||
    value === "undefined"
  );
}

export const isImage = (file) => {
  const validImageTypes = ["image/gif", "image/jpeg", "image/jpg", "image/png"];
  if (validImageTypes.includes(file.file.type)) return true;
  return false;
};

export const isVideo = (file) => {
  const validVideoTypes = ["video/webm", "video/mp4"];
  if (validVideoTypes.includes(file.file.type)) return true;
  return false;
};

export const isPdf = (file) => {
  const validVideoTypes = ["application/pdf"];
  if (validVideoTypes.includes(file.file.type)) return true;
  return false;
};

export const randomString = (length) => {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const generateUUID = () => {
  const s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };

  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
};

export const capitalize = (string) => {
  const removedSpecialCharacters = string.replace(/[^a-zA-Z0-9]/g, " ");

  const splitWords = removedSpecialCharacters.split(" ");
  const capitalized = splitWords.map(
    (dt) => `${dt[0].toUpperCase()}${dt.substring(1)}`
  );

  return capitalized.join(" ");
};

export const dateHandle = (date) => {
  const newDate = date
    ? new Date(date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  return newDate;
};

export const ghrapDate = (date) => {
  const newDate = new Date(date);
  var mS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  console.log(newDate.getDate(), mS[newDate.getMonth()]);

  return `${newDate.getDate()} ${mS[newDate.getMonth()]}`;
};

export const formatCode = function (code) {
  return prettier.format(code, {
    parser: "babel",
    plugins: [parserBabel],
    singleQuote: true,
    trailingComma: "es5",
    jsxSingleQuote: true,
    printWidth: 80,
    tabWidth: 2,
  });
};

/**
 * @typedef {Object} StringCaserOptions
 * @property {"space" | String} separator - define what separates each word, undefined returns no separation - passing "space" separates the words by a space
 * @property {"uppercase" | "lowercase" | "capitalize" | "camelCase" | "PascalCase"} casetype - text case type, uppercase, lowercase of capitalized
 */

/**
 *
 * @param {String} string - text to convert
 * @param {StringCaserOptions} options - options
 * @returns
 */
export const StringCaser = (string, { separator, casetype }) => {
  if (!string) return null;
  // const removedSpecialCharacters = string.replace(/[^a-zA-Z0-9]/g, " ");
  const removedSpecialCharacters = string.replace(/[^a-zA-Z0-9()%:]/g, " ");

  let casedText = [];
  const splitWords = removedSpecialCharacters.split(" ").filter(Boolean);

  if (casetype === "capitalize") {
    casedText = splitWords.map(
      (/** @type {string} */ dt) => `${dt[0].toUpperCase()}${dt.substring(1)}`
    );
  }
  if (casetype === "uppercase") {
    casedText = splitWords.map((/** @type {string} */ dt) => dt.toUpperCase());
  }
  if (casetype === "lowercase") {
    casedText = splitWords.map((/** @type {string} */ dt) => dt.toLowerCase());
  }
  if (casetype === "camelCase") {
    casedText = splitWords.map((/** @type {string} */ dt, index) =>
      index === 0
        ? dt.toLowerCase()
        : `${dt[0].toUpperCase()}${dt.substring(1)}`
    );
  }
  if (casetype === "PascalCase") {
    casedText = splitWords.map(
      (/** @type {string} */ dt) => `${dt[0].toUpperCase()}${dt.substring(1)}`
    );
  }

  if (separator) {
    if (separator === "space") {
      return casedText.join(" ");
    } else {
      return casedText.join(separator);
    }
  } else {
    return casedText.join("");
  }
};

export const csvFileMake = (data, name = "") => {
  const filename = name ? `${name}.csv` : "export.csv";
  let csvContent = "";

  for (let row = 0; row < data.length; row++) {
    let keysAmount = Object.keys(data[row]).length;
    let keysCounter = 0;

    if (row === 0) {
      let newKeyLine = "";
      let newValueLine = "";

      for (let key in data[row]) {
        // Wrap values containing commas in double quotes
        newKeyLine += `"${key}"${keysCounter + 1 < keysAmount ? "," : "\r\n"}`;
        newValueLine += `"${data[row][key]}"${
          keysCounter + 1 < keysAmount ? "," : "\r\n"
        }`;
        keysCounter++;
      }

      csvContent += newKeyLine;
      csvContent += newValueLine;
    } else {
      for (let key in data[row]) {
        // Wrap values containing commas in double quotes
        csvContent += `"${data[row][key]}"${
          keysCounter + 1 < keysAmount ? "," : "\r\n"
        }`;
        keysCounter++;
      }
    }

    keysCounter = 0;
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Download the file
  saveAs(blob, filename);
};

export const excelFileMake = async (data, name = "") => {
  const filename = name ? `${name}.xlsx` : "export.xlsx";

  let wb = XLSX.utils.book_new();
  let ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  let wbout = XLSX.write(wb, { type: "binary", bookType: "xlsx" });

  // Convert the binary string to a Blob
  let blob = await new Blob([s2ab(wbout)], {
    type: "application/octet-stream",
  });
  saveAs(blob, filename);
};

// Utility function to convert string to ArrayBuffer
function s2ab(s) {
  let buf = new ArrayBuffer(s.length);
  let view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

export const replacePlaceholders = (emailTemplate, replacements) => {
  let replacedText = emailTemplate;

  for (const key in replacements) {
    const pattern = new RegExp(`{{{${key}}}}`, "g");
    replacedText = replacedText.replace(pattern, replacements[key]);
  }
  return replacedText;
};

export const capitalizeString = (str) => {
  if (!str) return "";
  const arr = str.split(" ");
  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  const str2 = arr.join(" ");
  return str2 ? str2 : "";
};
export const state_county_change = async (
  value,
  setSelected_states,
  setFiltered_counties,
  setSelected_county,
  electionType = 1
  // All_counties
) => {
  let counties = [];

  if (value?.length < 2) {
    counties = await All_counties?.filter(
      (county) =>
        county?.state?.toLowerCase() === value[0]?.label?.toLowerCase()
    );
    setSelected_states(value);
  } else {
    counties = await All_counties?.filter(
      (county) =>
        county?.state?.toLowerCase() ===
        [value[value?.length - 1]][0]?.label?.toLowerCase()
    );
    setSelected_states([value[value?.length - 1]]);
  }
  setFiltered_counties(counties);
  if (Number(electionType) == 2) {
    setSelected_county([counties[0]]);
  } else {
    setSelected_county([]);
  }
  return counties;
};

export const county_change = (value, setSelected_county) => {
  if (value?.length < 2) {
    setSelected_county(value);
  } else {
    setSelected_county([value[value?.length - 1]]);
  }
};

export const handleSingleDropdownChange = (
  value,
  setSelectedState,
  setValue,
  inputName,
  valueAccessorStr = "value"
) => {
  try {
    if (!value.length || !setSelectedState || !setValue || !inputName) return;

    if (value?.length < 2) {
      setSelectedState(value);
      setValue(inputName, value[0][valueAccessorStr]);
    } else {
      setSelectedState([value[value?.length - 1]]);
      setValue(inputName, value[value?.length - 1][valueAccessorStr]);
    }
  } catch (error) {
    console.log("handleSingleDropdownChange->>", error);
  }
};

export const formatDate = (inputDate, formatSTR = "DD MMMM, YYYY") => {
  const date = moment.utc(inputDate);
  return date.format(formatSTR);
};

export const capitalizeWord = (word) => {
  try {
    const text_mod = word.trim();
    if (!text_mod) return;

    return text_mod.charAt(0).toUpperCase() + text_mod.slice(1);
  } catch (error) {
    console.log(error);
  }
};

export const JsonParse = (arrStr) => {
  try {
    const result = JSON.parse(arrStr);
    if (Array.isArray(result)) return result;
    else return [];
  } catch (error) {
    return [];
  }
};

export function JsonParseObj(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error("Invalid JSON:", e.message);
    return {};
  }
}

export async function updatePageSize({
  setPageSize,
  getDataFn,
  limit,
  filterState = {},
}) {
  try {
    setPageSize(limit);
    await getDataFn, (1, limit, filterState);
  } catch (error) {
    console.log("updatePageSize->>", error?.message);
  }
}

export async function previousPage({
  getDataFn,
  currentPage,
  pageSize,
  filterState = {},
}) {
  try {
    await getDataFn(
      currentPage - 1 > 1 ? currentPage - 1 : 1,
      pageSize,
      filterState
    );
  } catch (error) {
    console.log("previousPage->>", error.message);
  }
}

export async function nextPage({
  getDataFn,
  currentPage,
  pageCount,
  pageSize,
  filterState = {},
}) {
  try {
    await getDataFn(
      currentPage + 1 <= pageCount ? currentPage + 1 : 1,
      pageSize,
      filterState
    );
  } catch (error) {
    console.log("nextPage->>", error?.message);
  }
}

export function getSkillType(type) {
  switch (type) {
    case 0:
      return "None";
    case 1:
      return "Assisted";
    case 2:
      return "Unassisted";

    default:
      return "";
  }
}

export function getSkillStatusName(type) {
  switch (type) {
    case 0:
      return "Disabled";
    case 1:
      return "Enabled";

    default:
      return "";
  }
}

export function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export const permissionNames = {
  LEVEL: "level",
  SKILL: "skill",
  WORKSHEET: "worksheet",
  REPORT_CARD: "report card",
  DASHBOARD: "dashboard",
  APPLICATION_SETTING: "application setting",
  PARTICIPANT: "participant",
  USER: "user",
};

export function buildDefaultPermissions(role_id, organization_id, role_name) {
  if (role_name?.toLowerCase() === "administrator") {
    return [
      {
        role_id,
        organization_id,
        name: "level",
        view: true,
        add: true,
        delete: true,
        import: true,
        download: true,
        export: true,
        enable_disable: true,
        matrics_table: true,
        publish: true,
        review: true,
        document_upload: true,
      },
      {
        role_id,
        organization_id,
        name: "skill",
        view: true,
        add: true,
        delete: true,
        import: true,
        download: true,
        export: true,
        enable_disable: true,
        matrics_table: true,
        publish: true,
        review: true,
        document_upload: true,
      },
      {
        role_id,
        organization_id,
        name: "worksheet",
        view: true,
        add: true,
        delete: true,
        import: true,
        download: true,
        export: true,
        enable_disable: true,
        matrics_table: true,
        publish: true,
        review: true,
        document_upload: true,
      },
      {
        role_id,
        organization_id,
        name: "report card",
        view: true,
        add: true,
        delete: true,
        import: true,
        download: true,
        export: true,
        enable_disable: true,
        matrics_table: true,
        publish: true,
        review: true,
        document_upload: true,
      },
      {
        role_id,
        organization_id,
        name: "dashboard",
        view: true,
        add: true,
        delete: true,
        import: true,
        download: true,
        export: true,
        enable_disable: true,
        matrics_table: true,
        publish: true,
        review: true,
        document_upload: true,
      },
      {
        role_id,
        organization_id,
        name: "application setting",
        view: true,
        add: true,
        delete: true,
        import: true,
        download: true,
        export: true,
        enable_disable: true,
        matrics_table: true,
        publish: true,
        review: true,
        document_upload: true,
      },
      {
        role_id,
        organization_id,
        name: "season",
        view: true,
        add: true,
        delete: true,
        import: true,
        download: true,
        export: true,
        enable_disable: true,
        matrics_table: true,
        publish: true,
        review: true,
        document_upload: true,
      },
      {
        role_id,
        organization_id,
        name: "participant",
        view: true,
        add: true,
        delete: true,
        import: true,
        download: true,
        export: true,
        enable_disable: true,
        matrics_table: true,
        publish: true,
        review: true,
        document_upload: true,
      },
      {
        role_id,
        organization_id,
        name: "user",
        view: true,
        add: true,
        delete: true,
        import: true,
        download: true,
        export: true,
        enable_disable: true,
        matrics_table: true,
        publish: true,
        review: true,
        document_upload: true,
      },
    ];
  }

  const isInstructor = role_name?.toLowerCase() === "instructor";
  const permissions = [
    {
      role_id,
      organization_id,
      name: "level",
      view: true,
      add: false,
      delete: false,
      import: false,
      download: false,
      export: false,
      enable_disable: false,
      matrics_table: false,
      publish: false,
      review: false,
      document_upload: false,
    },
    {
      role_id,
      organization_id,
      name: "skill",
      view: true,
      add: false,
      delete: false,
      import: false,
      download: false,
      export: false,
      enable_disable: false,
      matrics_table: false,
      publish: false,
      review: false,
      document_upload: false,
    },
    {
      role_id,
      organization_id,
      name: "worksheet",
      view: true,
      add: true,
      delete: true,
      import: true,
      download: true,
      export: true,
      enable_disable: true,
      matrics_table: true,
      publish: true,
      review: true,
      document_upload: true,
    },
    {
      role_id,
      organization_id,
      name: "report card",
      view: true,
      add: true,
      delete: true,
      import: false,
      download: false,
      export: false,
      enable_disable: false,
      matrics_table: false,
      publish: isInstructor ? false : true,
      review: isInstructor ? true : false,
      document_upload: isInstructor ? true : false,
    },
    {
      role_id,
      organization_id,
      name: "dashboard",
      view: isInstructor ? false : true,
      add: false,
      delete: false,
      import: false,
      download: false,
      export: false,
      enable_disable: false,
      matrics_table: false,
      publish: false,
      review: false,
      document_upload: false,
    },
    {
      role_id,
      organization_id,
      name: "application setting",
      view: false,
      add: false,
      delete: false,
      import: false,
      download: false,
      export: false,
      enable_disable: false,
      matrics_table: false,
      publish: false,
      review: false,
      document_upload: false,
    },
    {
      role_id,
      organization_id,
      name: "season",
      view: false,
      add: false,
      delete: false,
      import: false,
      download: false,
      export: false,
      enable_disable: false,
      matrics_table: false,
      publish: false,
      review: false,
      document_upload: false,
    },
    {
      role_id,
      organization_id,
      name: "participant",
      view: true,
      add: true,
      delete: true,
      import: false,
      download: false,
      export: false,
      enable_disable: false,
      matrics_table: false,
      publish: false,
      review: false,
      document_upload: false,
    },
    {
      role_id,
      organization_id,
      name: "user",
      view: false,
      add: false,
      delete: false,
      import: false,
      download: false,
      export: false,
      enable_disable: false,
      matrics_table: false,
      publish: false,
      review: false,
      document_upload: false,
    },
  ];

  return permissions;
}

export const updateColors = (colors = {}) => {
  try {
    const root = document.documentElement;

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key.replace("_", "-")}`, value);
    });
  } catch (error) {
    console.log("udpateColors->>", error?.message);
  }
};

export const parseCsvData = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log("Parsed CSV:", results.data);
        resolve(results.data);
      },
      error: (err) => {
        console.error("Error parsing CSV:", err);
        reject(err);
      },
    });
  });
};

export const parseExcelData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

export const participantSchema = yup.object().shape({
  first_name: yup.string().nullable(),
  last_name: yup.string().nullable(),
  unique_id: yup.string().required("Unique ID is required"),
  contact_number: yup
    .string()
    .nullable()
    .matches(/^[0-9+\- ]*$/, "Invalid contact number"),
  parent_email: yup.string().nullable().email("Invalid email"),
  status: yup
    .string()
    .oneOf(["active", "inactive", null], "Invalid status")
    .nullable(),
  organization_id: yup.number().nullable(),
});

export const weekDays = [
  { label: "Sunday", value: "sunday" },
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" },
];

export const participantPassFailCheck = ({ skills = [], minPassMark }) => {
  if (!skills?.length || !minPassMark)
    throw new Error("Skills and min pass mark are required");
  try {
    let isParticipantPass = true;
    let totalPassSkills = 0;

    skills?.map((item) => {
      if (item?.is_required && !item?.pass) {
        isParticipantPass = false;
      }

      if (item?.pass) totalPassSkills += 1;
    });

    // calculate percantage of the pass skills
    const percantage = (totalPassSkills * 100) / skills?.length;

    if (percantage < minPassMark) isParticipantPass = false;

    return isParticipantPass;
  } catch (error) {
    console.log("participantPassFailCheck->>", error?.message);
    return null;
  }
};

export const worksheetStatus = {
  active: "active",
  inProgress: "in progress",
  inReview: "in review",
  indocument_upload: "in review",
  published: "published",
};
export const participantReportCardStatus = {
  inProgress: "in progress",
  inReview: "in review",
  indocument_upload: "in review",
  published: "published",
  withdrawn: "withdrawn",
};

const getRandomColor = () =>
  "#" +
  Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");
const predefinedColors = [
  "#67C090",
  "#56b381",
  "#26667F",
  "#DDF4E7",
  "#21272A",
  "#222222",
  "#545F71",
  "#9ca3af",
  "#F2F4F8",
];

export const transformParticipantStats = (data) => {
  const series = [];
  const labels = [];
  const colors = [];

  try {
    data?.forEach((item, index) => {
      series.push(item?.active_participants + item?.inactive_participants || 0);
      labels.push(item?.location_name || "Unknown");

      // Use predefined colors first, then random
      if (index < predefinedColors.length) {
        colors.push(predefinedColors[index]);
      } else {
        colors.push(getRandomColor());
      }
    });
  } catch (error) {
    console.error(error);
  }

  return {
    series,
    options: {
      labels,
      chart: { type: "donut" },
      dataLabels: { enabled: false },
      legend: { position: "right" },
      colors,
    },
  };
};

export const transformReportCardStats = (data) => {
  const series = [
    data?.in_progress,
    data?.in_review,
    data?.published,
    data?.withdrawn,
  ];
  const labels = ["In Progress", "In Review", "Published", "Withdrawn"];

  return {
    series,
    options: {
      labels,
      chart: { type: "donut" },
      dataLabels: { enabled: false },
      legend: { position: "right" },
      colors: predefinedColors,
    },
  };
};

export const generatePDF = async ({ ref, reportName = "report-card.pdf" }) => {
  if (!ref?.current) return;

  const input = ref?.current;
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;

  const canvas = await html2canvas(input, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL("image/png");
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = margin;

  pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
  heightLeft -= pageHeight - margin * 2;

  while (heightLeft > 0) {
    pdf.addPage();
    position = margin - (imgHeight - heightLeft);
    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;
  }

  pdf.save(reportName);
};

export const handlePrint = ({ ref, title = "Worksheet" }) => {
  if (!ref?.current) return;

  const printContents = ref?.current?.innerHTML;
  const newWindow = window.open("", "_blank");

  // Copy all <link> and <style> tags (important for Tailwind!)
  const styles = Array.from(document.styleSheets)
    .map((styleSheet) => {
      try {
        return Array.from(styleSheet.cssRules)
          .map((rule) => rule.cssText)
          .join("");
      } catch (e) {
        // Some stylesheets are CORS-protected, ignore them
        return "";
      }
    })
    .join("\n");

  newWindow.document.write(`
    <html>
      <head>
        <title>Worksheet Print</title>
        <style>${styles}</style>
        <style>
          /* Optional print tweaks */
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          .no-print {
            display: none;
          }
        </style>
      </head>
      <body>
        ${printContents}
      </body>
    </html>
  `);

  newWindow.document.close();
  newWindow.focus();

  // Wait a tick to ensure styles apply before printing
  setTimeout(() => {
    newWindow.print();
    newWindow.close();
  }, 500);
};

const EXCEL_EPOCH = moment("1899-12-30", "YYYY-MM-DD");

// Convert Excel serial date to YYYY-MM-DD
export const excelDateToMoment = (serial) => {
  return moment(EXCEL_EPOCH).add(serial, "days");
};

// Convert Excel serial time (fraction of a day) to HH:mm:ss
export const excelTimeToMoment = (serial) => {
  const totalSeconds = Math.round(serial * 24 * 60 * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return moment({ hour: hours, minute: minutes, second: seconds });
};

export const reportCardNameOptions = [
  { label: "First name only", value: 1 },
  { label: "First name last initial", value: 2 },
  { label: "First initial last name", value: 3 },
  { label: "First and last name", value: 4 },
];

export const defaultColors = {
  primary: "#149c4a",
  "primary-dark": "#56b381",
  secondary: "#26667f",
  "light-info": "#DDF4E7",
  accent: "#21272A",
  neutral: "#222222",
  "neutral-gray": "#9ca3af",
  "input-bg": "#F2F4F8",
};

export function formatName(firstName, lastName, option) {
  if (!firstName && !lastName) return "";

  const firstTwo = (str) => (str ? str.slice(0, 2) : "");
  const lastTwo = (str) => (str ? str.slice(0, 2) : "");

  switch (option) {
    case 1:
      // first name only
      return firstName;
    case 2:
      // first name + last initial (first 2 letters + .)
      return lastName ? `${firstName} ${firstTwo(lastName)}.` : firstName;
    case 3:
      // first initial (first 2 letters + .) + last name
      return firstName
        ? `${firstTwo(firstName)}. ${lastName || ""}`.trim()
        : lastName;
    case 4:
      // first and last name
      return `${firstName || ""} ${lastName || ""}`.trim();
    default:
      return `${firstName || ""} ${lastName || ""}`.trim();
  }
}
