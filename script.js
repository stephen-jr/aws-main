var albumBucketName = 'ferma-edms';

// **DO THIS**:
//   Replace this block of code with the sample code located at:
//   Cognito -- Manage Identity Pools -- [identity_pool_name] -- Sample Code -- JavaScript
//
// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'eu-central-1'; // Region
// AWS.config.

// Create a new service object
var s3 = new AWS.S3({
    accessKeyId: "PQ5YW6QCO0THAVGAL4WO",
    secretAccessKey: "R5SbFAY5p9RiveblRfeYRkdf7GF2ZfbjcgCMmh9r",
    apiVersion: 'latest',
    endpoint: "https://eu-central-1.linodeobjects.com",
    region: AWS.config.region,
    params: {Bucket: albumBucketName}
});

// A utility function to create HTML.
function getHtml(template) {
  return template.join('\n');
}
// snippet-end:[s3.JavaScript.s3_PhotoViewer.config]


//
// Functions
//

// snippet-start:[s3.JavaScript.s3_PhotoViewer.listAlbums]
// List the photo albums that exist in the bucket.
function listAlbums() {
  s3.listObjects({Delimiter: '/'}, function(err, data) {
    console.log(data);
    if (err) {
      return alert('There was an error listing your albums: ' + err.message);
    } else {
      var albums = data.CommonPrefixes.map(function(commonPrefix) {
        var prefix = commonPrefix.Prefix;
        var albumName = decodeURIComponent(prefix.replace('/', ''));
        return getHtml([
          '<li>',
            '<button style="margin:5px;" onclick="viewAlbum(\'' + albumName + '\')">',
              albumName,
            '</button>',
          '</li>'
        ]);
      });
      var message = albums.length ?
        getHtml([
          '<p>Click on an album name to view it.</p>',
        ]) :
        '<p>You do not have any albums. Please Create album.';
      var htmlTemplate = [
        '<h2>Albums</h2>',
        message,
        '<ul>',
          getHtml(albums),
        '</ul>',
      ]
      document.getElementById('viewer').innerHTML = getHtml(htmlTemplate);
    }
  });
}
// snippet-end:[s3.JavaScript.s3_PhotoViewer.listAlbums]

// snippet-start:[s3.JavaScript.s3_PhotoViewer.viewAlbum]
// Show the photos that exist in an album.
function viewAlbum(albumName) {
  var albumPhotosKey = encodeURIComponent(albumName) + '/';
  s3.listObjects({Prefix: albumPhotosKey}, function(err, data) {
    if (err) {
      return alert('There was an error viewing your album: ' + err.message);
    }
    // 'this' references the AWS.Request instance that represents the response
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + '/';

    var photos = data.Contents.map(function(photo) {
      var photoKey = photo.Key;
      var photoUrl = bucketUrl + encodeURIComponent(photoKey);
      return getHtml([
        '<span>',
          '<div>',
            '<br/>',
            '<img style="width:128px;height:128px;" src="' + photoUrl + '"/>',
          '</div>',
          '<div>',
            '<span>',
              photoKey.replace(albumPhotosKey, ''),
            '</span>',
          '</div>',
        '</span>',
      ]);
    });
    var message = photos.length ?
      '<p>The following photos are present.</p>' :
      '<p>There are no photos in this album.</p>';
    var htmlTemplate = [
      '<div>',
        '<button onclick="listAlbums()">',
          'Back To Albums',
        '</button>',
      '</div>',
      '<h2>',
        'Album: ' + albumName,
      '</h2>',
      message,
      '<div>',
        getHtml(photos),
      '</div>',
      '<h2>',
        'End of Album: ' + albumName,
      '</h2>',
      '<div>',
        '<button onclick="listAlbums()">',
          'Back To Albums',
        '</button>',
      '</div>',
    ]
    document.getElementById('viewer').innerHTML = getHtml(htmlTemplate);
    document.getElementsByTagName('img')[0].setAttribute('style', 'display:none;');
  });
}

// listAlbums();


// listAlbums = async () => {
//     try {
//       const data = await s3.listObjects(
//           new ListObjects({ Delimiter: "/", Bucket: albumBucketName })
//       );
  
//       if (data.CommonPrefixes === undefined) {
//         const htmlTemplate = [
//           "<p>You don't have any albums. You need to create an album.</p>",
//           "<button onclick=\"createAlbum(prompt('Enter album name:'))\">",
//           "Create new album",
//           "</button>",
//         ];
//         document.getElementById("app").innerHTML = htmlTemplate;
//       } else {
//         var albums = data.CommonPrefixes.map(function (commonPrefix) {
//           var prefix = commonPrefix.Prefix;
//           var albumName = decodeURIComponent(prefix.replace("/", ""));
//           return getHtml([
//             "<li>",
//             "<span onclick=\"deleteAlbum('" + albumName + "')\">X</span>",
//             "<span onclick=\"viewAlbum('" + albumName + "')\">",
//             albumName,
//             "</span>",
//             "</li>",
//           ]);
//         });
//         var message = albums.length
//             ? getHtml([
//               "<p>Click an album name to view it.</p>",
//               "<p>Click the X to delete the album.</p>",
//             ])
//             : "<p>You do not have any albums. You need to create an album.";
//         const htmlTemplate = [
//           "<h2>Albums</h2>",
//           message,
//           "<ul>",
//           getHtml(albums),
//           "</ul>",
//           "<button onclick=\"createAlbum(prompt('Enter Album Name:'))\">",
//           "Create new Album",
//           "</button>",
//         ];
//         document.getElementById("app").innerHTML = getHtml(htmlTemplate);
//       }
//     } catch (err) {
//       return alert("There was an error listing your albums: " + err.message);
//     }
//   };
  
  // Make listAlbums function available to the browser
  // window.listAlbums = listAlbums;
  
  
  // // Create an album in the bucket
  // const createAlbum = async (albumName) => {
  //   albumName = albumName.trim();
  //   if (!albumName) {
  //     return alert("Album names must contain at least one non-space character.");
  //   }
  //   if (albumName.indexOf("/") !== -1) {
  //     return alert("Album names cannot contain slashes.");
  //   }
  //   var albumKey = encodeURIComponent(albumName);
  //   try {
  //     const key = albumKey + "/";
  //     const params = { Bucket: albumBucketName, Key: key };
  //     const data = await s3.send(new PutObjectCommand(params));
  //     alert("Successfully created album.");
  //     viewAlbum(albumName);
  //   } catch (err) {
  //     return alert("There was an error creating your album: " + err.message);
  //   }
  // };
  
  // // Make createAlbum function available to the browser
  // window.createAlbum = createAlbum;
  
  
  // // View the contents of an album
  
  // const viewAlbum = async (albumName) => {
  //   const albumPhotosKey = encodeURIComponent(albumName) + "/";
  //   try {
  //     const data = await s3.send(
  //         new ListObjectsCommand({
  //           Prefix: albumPhotosKey,
  //           Bucket: albumBucketName,
  //         })
  //     );
  //     if (data.Contents.length === 1) {
  //       var htmlTemplate = [
  //         "<p>You don't have any photos in this album. You need to add photos.</p>",
  //         '<input id="photoupload" type="file" accept="image/*">',
  //         '<button id="addphoto" onclick="addPhoto(\'' + albumName + "')\">",
  //         "Add photo",
  //         "</button>",
  //         '<button onclick="listAlbums()">',
  //         "Back to albums",
  //         "</button>",
  //       ];
  //       document.getElementById("app").innerHTML = getHtml(htmlTemplate);
  //     } else {
  //       console.log(data);
  //       const href = "https://s3." + REGION + ".amazonaws.com/";
  //       const bucketUrl = href + albumBucketName + "/";
  //       const photos = data.Contents.map(function (photo) {
  //         const photoKey = photo.Key;
  //         console.log(photo.Key);
  //         const photoUrl = bucketUrl + encodeURIComponent(photoKey);
  //         return getHtml([
  //           "<span>",
  //           "<div>",
  //           '<img style="width:128px;height:128px;" src="' + photoUrl + '"/>',
  //           "</div>",
  //           "<div>",
  //           "<span onclick=\"deletePhoto('" +
  //           albumName +
  //           "','" +
  //           photoKey +
  //           "')\">",
  //           "X",
  //           "</span>",
  //           "<span>",
  //           photoKey.replace(albumPhotosKey, ""),
  //           "</span>",
  //           "</div>",
  //           "</span>",
  //         ]);
  //       });
  //       var message = photos.length
  //           ? "<p>Click the X to delete the photo.</p>"
  //           : "<p>You don't have any photos in this album. You need to add photos.</p>";
  //       const htmlTemplate = [
  //         "<h2>",
  //         "Album: " + albumName,
  //         "</h2>",
  //         message,
  //         "<div>",
  //         getHtml(photos),
  //         "</div>",
  //         '<input id="photoupload" type="file" accept="image/*">',
  //         '<button id="addphoto" onclick="addPhoto(\'' + albumName + "')\">",
  //         "Add photo",
  //         "</button>",
  //         '<button onclick="listAlbums()">',
  //         "Back to albums",
  //         "</button>",
  //       ];
  //       document.getElementById("app").innerHTML = getHtml(htmlTemplate);
  //       document.getElementsByTagName("img")[0].remove();
  //     }
  //   } catch (err) {
  //     return alert("There was an error viewing your album: " + err.message);
  //   }
  // };
  // // Make viewAlbum function available to the browser
  // window.viewAlbum = viewAlbum;
  
  
  // // Add a photo to an album
  // const addPhoto = async (albumName) => {
  //   const files = document.getElementById("photoupload").files;
  //   try {
  //     const albumPhotosKey = encodeURIComponent(albumName) + "/";
  //     const data = await s3.send(
  //         new ListObjectsCommand({
  //           Prefix: albumPhotosKey,
  //           Bucket: albumBucketName
  //         })
  //     );
  //     const file = files[0];
  //     const fileName = file.name;
  //     const photoKey = albumPhotosKey + fileName;
  //     const uploadParams = {
  //       Bucket: albumBucketName,
  //       Key: photoKey,
  //       Body: file
  //     };
  //     try {
  //       const data = await s3.send(new PutObjectCommand(uploadParams));
  //       alert("Successfully uploaded photo.");
  //       viewAlbum(albumName);
  //     } catch (err) {
  //       return alert("There was an error uploading your photo: ", err.message);
  //     }
  //   } catch (err) {
  //     if (!files.length) {
  //       return alert("Choose a file to upload first.");
  //     }
  //   }
  // };
  // // Make addPhoto function available to the browser
  // window.addPhoto = addPhoto;
  
  
  // // Delete a photo from an album
  // const deletePhoto = async (albumName, photoKey) => {
  //   try {
  //     console.log(photoKey);
  //     const params = { Key: photoKey, Bucket: albumBucketName };
  //     const data = await s3.send(new DeleteObjectCommand(params));
  //     console.log("Successfully deleted photo.");
  //     viewAlbum(albumName);
  //   } catch (err) {
  //     return alert("There was an error deleting your photo: ", err.message);
  //   }
  // };
  // // Make deletePhoto function available to the browser
  // window.deletePhoto = deletePhoto;
  
  
  // // Delete an album from the bucket
  // const deleteAlbum = async (albumName) => {
  //   const albumKey = encodeURIComponent(albumName) + "/";
  //   try {
  //     const params = { Bucket: albumBucketName, Prefix: albumKey };
  //     const data = await s3.send(new ListObjectsCommand(params));
  //     const objects = data.Contents.map(function (object) {
  //       return { Key: object.Key };
  //     });
  //     try {
  //       const params = {
  //         Bucket: albumBucketName,
  //         Delete: { Objects: objects },
  //         Quiet: true,
  //       };
  //       const data = await s3.send(new DeleteObjectsCommand(params));
  //       listAlbums();
  //       return alert("Successfully deleted album.");
  //     } catch (err) {
  //       return alert("There was an error deleting your album: ", err.message);
  //     }
  //   } catch (err) {
  //     return alert("There was an error deleting your album1: ", err.message);
  //   }
  // };
  // // Make deleteAlbum function available to the browser
  // window.deleteAlbum = deleteAlbum;

  listAlbums();
  $(function(){
    $('#form-1').submit(function(event){
      event.preventDefault();
      let uploadParams = {
        Bucket: albumBucketName,
        
      }
    }, false)
  });