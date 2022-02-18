const { S3Client } = require("@aws-sdk/client-s3");
import {
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsCommand } from "@aws-sdk/client-s3";


function getHtml(template) {
  return template.join("\n");
}
// Make getHTML function available to the browser
window.getHTML = getHtml;

const REGION = "eu-central-1";

let s3 = new S3Client({
    credentials:{
      accessKeyId: "PQ5YW6QCO0THAVGAL4WO",
      secretAccessKey: "R5SbFAY5p9RiveblRfeYRkdf7GF2ZfbjcgCMmh9r",
    },
    apiVersion: 'latest',
    endpoint: "https://eu-central-1.linodeobjects.com",
    region: REGION
});

let folderBucketName = "ferma-edms";

// List the file folders that exist in the bucket
const listfolders = async () => {
  try {
    const data = await s3.send(
        new ListObjectsCommand({ Delimiter: "/", Bucket: folderBucketName })
    );
    console.log({listfolders: data });
    if (data.CommonPrefixes === undefined) {
      const htmlTemplate = [
        "<p>You don't have any folders. You need to create an folder.</p>",
        "<button onclick=\"createfolder(prompt('Enter folder name:'))\">",
        "Create new folder",
        "</button>",
      ];
      document.getElementById("app").innerHTML = htmlTemplate;
    } else {
      var folders = data.CommonPrefixes.map(function (commonPrefix) {
        var prefix = commonPrefix.Prefix;
        var folderName = decodeURIComponent(prefix.replace("/", ""));
        return getHtml([
          "<li>",
          "<span onclick=\"deletefolder('" + folderName + "')\">X</span>",
          "<span onclick=\"viewfolder('" + folderName + "')\">",
          folderName,
          "</span>",
          "</li>",
        ]);
      });
      var message = folders.length
          ? getHtml([
            "<p>Click an folder name to view it.</p>",
            "<p>Click the X to delete the folder.</p>",
          ])
          : "<p>You do not have any folders. You need to create an folder.";
      const htmlTemplate = [
        "<h2>Folders</h2>",
        message,
        "<ul>",
        getHtml(folders),
        "</ul>",
        "<button onclick=\"createfolder(prompt('Enter folder Name:'))\">",
        "Create new folder",
        "</button>",
      ];
      document.getElementById("app").innerHTML = getHtml(htmlTemplate);
    }
  } catch (err) {
    return alert("There was an error listing your folders: " + err.message);
  }
};

// Make listfolders function available to the browser
window.listfolders = listfolders;


// Create an folder in the bucket
const createfolder = async (folderName) => {
  folderName = folderName.trim();
  if (!folderName) {
    return alert("folder names must contain at least one non-space character.");
  }
  if (folderName.indexOf("/") !== -1) {
    return alert("folder names cannot contain slashes.");
  }
  var folderKey = encodeURIComponent(folderName);
  try {
    const key = folderKey + "/";
    const params = { Bucket: folderBucketName, Key: key };
    const data = await s3.send(new PutObjectCommand(params));
    console.log({createFolder: data});
    alert("Successfully created folder.");
    viewfolder(folderName);
  } catch (err) {
    return alert("There was an error creating your folder: " + err.message);
  }
};

// Make createfolder function available to the browser
window.createfolder = createfolder;


// View the contents of an folder

const viewfolder = async (folderName) => {
  const folderfilesKey = encodeURIComponent(folderName) + "/";
  try {
    const data = await s3.send(
        new ListObjectsCommand({
          Prefix: folderfilesKey,
          Bucket: folderBucketName,
        })
    );
    console.log({viewfolder: data});
    if (data.Contents.length === 1) {
      var htmlTemplate = [
        "<p>You don't have any files in this folder. You need to add files.</p>",
        '<input id="fileupload" type="file" accept="*">',
        '<button id="addfile" onclick="addfile(\'' + folderName + "')\">",
        "Add file",
        "</button>",
        '<button onclick="listfolders()">',
        "Back to folders",
        "</button>",
      ];
      document.getElementById("app").innerHTML = getHtml(htmlTemplate);
    } else {
      const href = "https://"+ folderBucketName + "." + REGION + ".linodeobjects.com";
      const bucketUrl = href + "/";
      const files = data.Contents.map(function (file) {
        const fileKey = file.Key;
        console.log(file.Key);
        const fileUrl = bucketUrl + encodeURIComponent(fileKey);
        return getHtml([
          "<span>",
          "<div>",
          '<img style="width:128px;height:128px;" src="' + fileUrl + '"/>',
          "</div>",
          "<div>",
          "<span onclick=\"deletefile('" +
          folderName +
          "','" +
          fileKey +
          "')\">",
          "X",
          "</span>",
          "<span>",
          fileKey.replace(folderfilesKey, ""),
          "</span>",
          "</div>",
          "</span>",
        ]);
      });
      var message = files.length
          ? "<p>Click the X to delete the file.</p>"
          : "<p>You don't have any files in this folder. You need to add files.</p>";
      const htmlTemplate = [
        "<h2>",
        "Folder: " + folderName,
        "</h2>",
        message,
        "<div>",
        getHtml(files),
        "</div>",
        '<input id="fileupload" type="file" accept="image/*">',
        '<button id="addfile" onclick="addfile(\'' + folderName + "')\">",
        "Add file",
        "</button>",
        '<button onclick="listfolders()">',
        "Back to folders",
        "</button>",
      ];
      document.getElementById("app").innerHTML = getHtml(htmlTemplate);
      document.getElementsByTagName("img")[0].remove();
    }
  } catch (err) {
    return alert("There was an error viewing your folder: " + err.message);
  }
};
// Make viewfolder function available to the browser
window.viewfolder = viewfolder;


// Add a file to an folder
const addfile = async (folderName) => {
  const files = document.getElementById("fileupload").files;
  try {
    const folderfilesKey = encodeURIComponent(folderName) + "/";
    const data = await s3.send(
        new ListObjectsCommand({
          Prefix: folderfilesKey,
          Bucket: folderBucketName
        })
    );
    console.log({addfile: data});
    const file = files[0];
    const fileName = file.name;
    const fileKey = folderfilesKey + fileName;
    const uploadParams = {
      Bucket: folderBucketName,
      Key: fileKey,
      Body: file
    };
    try {
      const data = await s3.send(new PutObjectCommand(uploadParams));
      alert("Successfully uploaded file.");
      viewfolder(folderName);
    } catch (err) {
      return alert("There was an error uploading your file: ", err.message);
    }
  } catch (err) {
    if (!files.length) {
      return alert("Choose a file to upload first.");
    }
  }
};
// Make addfile function available to the browser
window.addfile = addfile;


// Delete a file from an folder
const deletefile = async (folderName, fileKey) => {
  try {
    console.log(fileKey);
    const params = { Key: fileKey, Bucket: folderBucketName };
    const data = await s3.send(new DeleteObjectCommand(params));
    console.log({viewfile: data});
    console.log("Successfully deleted file.");
    viewfolder(folderName);
  } catch (err) {
    return alert("There was an error deleting your file: ", err.message);
  }
};
// Make deletefile function available to the browser
window.deletefile = deletefile;


// Delete an folder from the bucket
const deletefolder = async (folderName) => {
  const folderKey = encodeURIComponent(folderName) + "/";
  try {
    const params = { Bucket: folderBucketName, Prefix: folderKey };
    const data = await s3.send(new ListObjectsCommand(params));
    const objects = data.Contents.map(function (object) {
      return { Key: object.Key };
    });
    try {
      const params = {
        Bucket: folderBucketName,
        Delete: { Objects: objects },
        Quiet: true,
      };
      const data = await s3.send(new DeleteObjectsCommand(params));
      console.log({deletefolder: data});
      listfolders();
      return alert("Successfully deleted folder.");
    } catch (err) {
      return alert("There was an error deleting your folder: ", err.message);
    }
  } catch (err) {
    return alert("There was an error deleting your folder1: ", err.message);
  }
};
// Make deletefolder function available to the browser
window.deletefolder = deletefolder;

