document.getElementById("fileToUpload").addEventListener("change", function (event) {
  
  ProcessImage();
}, false);


function DetectLabels(imageData) {
  AWS.region = "ap-south-1";
  var rekognition = new AWS.Rekognition();
  var params = {
    Image: {
      Bytes: imageData
    },
    MaxLabels: 5,
    MinConfidence: 90
  };
  rekognition.detectLabels(params, function (err, data) {
    document.getElementById("detectedl").style = "overflow: auto;  width: 100%; height: auto; align-self: center;";
    if (err) console.log(err, err.stack); 
    else {
      var str = ''

      for (i = 0; i < data.Labels.length; i++) {
        str += data.Labels[i].Name + ' - Confidence ' + data.Labels[i].Confidence.toFixed(2) + '%<br><br>'
    
      }
      console.log
      if(str=='') str='No Items Detected'
      document.getElementById("detectedl").innerHTML = str;
    }
  });
}

function DetectTexts(imageData) {
  document.getElementById("detectedt").style = "overflow: auto;  width: 100%; height: auto; align-self: center;";
  AWS.region = "ap-south-1";
  var rekognition = new AWS.Rekognition();
  var params = {
    Image: {
      Bytes: imageData
    }
  }

  rekognition.detectText(params, function (err, data) {
    if (err) console.log(err, err.stack); 
    else {
      txt = ''

      for (i = 0; i < data.TextDetections.length; i++) {
        if ((data.TextDetections[i].Type == 'LINE'))
        txt +=  data.TextDetections[i].DetectedText  + '<br> '
      }
      if(txt=='') txt='No Text Detected'
      document.getElementById("detectedt").innerHTML = txt;
    }
  });
}
function DetectFaces(imageData) {
  document.getElementById("detectedf").style = "overflow: auto;  width: 100%; height:200px; align-self: center;";
  AWS.region = "ap-south-1";
  var rekognition = new AWS.Rekognition();
  var params = {
    Attributes: ['ALL'],
    Image: {
      Bytes: imageData
    }
  }

  rekognition.detectFaces(params, function (err, data) {
    if (err) console.log(err, err.stack); 
    else {
      str = ''
      str += 'Faces detected:' + data.FaceDetails.length + '<br> <br>'
    
      for (i = 0; i < data.FaceDetails.length; i++) {
        face = i + 1
        str += 'Face(' + face + '):<br>'
        str += 'Age between ' + data.FaceDetails[i].AgeRange.Low + ' and ' + data.FaceDetails[i].AgeRange.High + '%<br>'
        str += 'Smiling = ' + data.FaceDetails[i].Smile.Value + ', Confidence ' + data.FaceDetails[i].Smile.Confidence.toFixed(2) + '%<br>'
        str += 'Eyeglasses = ' + data.FaceDetails[i].Eyeglasses.Value + ', Confidence ' + data.FaceDetails[i].Eyeglasses.Confidence.toFixed(2) + '%<br>'
        str += 'EyesOpen = ' + data.FaceDetails[i].Eyeglasses.Value + ', Confidence ' + data.FaceDetails[i].EyesOpen.Confidence.toFixed(2) + '%<br>'
        str += 'Gender = ' + data.FaceDetails[i].Gender.Value + ', Confidence ' + data.FaceDetails[i].Gender.Confidence.toFixed(2) + '%<br>'
        str += 'Mouth Open = ' + data.FaceDetails[i].MouthOpen.Value + ', Confidence ' + data.FaceDetails[i].MouthOpen.Confidence.toFixed(2) + '%<br>'
        str += 'Mustache = ' + data.FaceDetails[i].Mustache.Value + ', Confidence ' + data.FaceDetails[i].Mustache.Confidence.toFixed(2) + '%<br>'
        str += 'Sunglasses = ' + data.FaceDetails[i].Sunglasses.Value + ', Confidence ' + data.FaceDetails[i].Sunglasses.Confidence.toFixed(2) + '%<br>'

        str += 'Emotions:\n'
        for (j = 0; j < data.FaceDetails[i].Emotions.length; j++) {
          str += data.FaceDetails[i].Emotions[j].Type + ', Confidence ' + data.FaceDetails[i].Emotions[j].Confidence.toFixed(2) + '%<br>'
        }
        str += '<br>'
    }
      
      document.getElementById("detectedf").innerHTML = str;
  }
});
}

function ProcessImage() {

  AnonLog();
  var control = document.getElementById("fileToUpload");
  var file = control.files[0];


  var reader = new FileReader();
  reader.onload = (function (theFile) {
 
    return function (e) {
      var img = document.createElement('img');
      var image = null;
      img.src = e.target.result;
      var jpg = true;
      try {
        image = atob(e.target.result.split("data:image/jpeg;base64,")[1]);

      } catch (e) {
        jpg = false;
      }
      if (jpg == false) {
        try {
          image = atob(e.target.result.split("data:image/png;base64,")[1]);
        } catch (e) {
          alert("Not an image file Rekognition can process");
          return;
        }
      }

      var length = image.length;
      imageBytes = new ArrayBuffer(length);
      var ua = new Uint8Array(imageBytes);
      for (var i = 0; i < length; i++) {
        ua[i] = image.charCodeAt(i);
      }
  
      var output = document.getElementById('output_image');
      output.src = reader.result;
      DetectLabels(imageBytes);
      DetectTexts(imageBytes);
      DetectFaces(imageBytes);
    };
  })(file);
  reader.readAsDataURL(file);
}

function AnonLog() {
////////////////////////////////////ADD YOUR COGNITO IDENTITY POOL HERE////////////////////////////////////////////////
  AWS.config.region = 'YOUR REGION'; 
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: 'YOUR_COGNITO_IDENTITY_POOL_ID',
  });
/////////////////////////////////////////////////END////////////////////////////////////////////////
  AWS.config.credentials.get(function () {
    var accessKeyId = AWS.config.credentials.accessKeyId;
    var secretAccessKey = AWS.config.credentials.secretAccessKey;
    var sessionToken = AWS.config.credentials.sessionToken;
  });
}
