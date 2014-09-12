var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport("SMTP", {
        service: 'Gmail',
        auth: {
            user: "tapsupport@iamstudio.co",
            pass: "iAmStudio1"
        }
});
var message = function(status,device_info){
	var device = JSON.parse(device_info);
	var device_name = device.name;
	device_name=device.name.replace('+',' ');
	console.log(device);
	
	var image_attachment="";
	var subject="DroidSecure";
	if(status=='location'){
		subject='DroidSecure found your device!';
	}
	else if(status=='sneakpeak'){
		subject='Sneak Peak! A picture has been taken';
		if(device.image_data){
		image_attachment={fileName: device.image_name,
	            		  contents: new Buffer(device.image_data, 'base64'),
						  cid: 'sneak@node'}
	    }
	}
	else if(status=='battery'){
		subject='Your device is running out of battery!';
	}
		result={
		    from: 'DroidSecure <location@droidsecure.com>',
		    to: '<'+device.account+'>',
		    subject: subject,
		    headers: {
		        'X-Secure-level': 1000
		    },
		    text: '',
		    html:'<p><img style="-webkit-user-select: none; cursor: -webkit-zoom-in;" src="http://www.google.com/staticmap?center='+device.lat+','+device.lon+'&amp;markers='+device.lat+','+device.lon+',red&amp;zoom=18&amp;size=400x300&amp;key=ABQIAAAA6C4bndUCBastUbawfhKGURQviNTBAztVc6-FhSQEQv6BdFn_BBRfktMUHCKH-MICXpvRmJU3x-Ly0w" width="400" height="300"></p>'
		    +'<p>Battery Level: '+device.battery_level+'%</p>'
		    +'<p>Location: '+device.lat+','+device.lon+'</p>'
		    +'<p>Device Name: '+device_name+'</p>'
		    +'<p>Device Account: '+device.account+'</p>',	   
	 attachments:[image_attachment,]
	
		   };
	   return result;
};
var password_message = function(mail,password){
	var subject = "Your Droid Secure Password!"
		result={
		    from: 'DroidSecure <location@droidsecure.com>',
		    to: '<'+mail+'>',
		    subject: subject,
		    headers: {
		        'X-Secure-level': 1000
		    },
		    text: '',
		    html:'<p>Your new Droid Secure Password is: '+password+'</p>'+
		    	 '<p>In this Beta version is not possible to change the password. But very soon this will be made from settings menu.</p>',	   	
		   };
	   return result;
};
exports.send_mail= function(req,res){
	transport.sendMail(message(req.body.status,req.body.device_info), function(err){
	    if(err){
	        res.json({status:0,message:'error',error:err})
	        console.log(err.message);
	        return;
	    }
	    console.log('Message sent successfully!');
	    res.json({status:1,message:'mail sent',error:0});
	    // if you don't want to use this transport object anymore, uncomment following line
	    //transport.close(); // close the connection pool
	});
};
exports.send_password= function(req,res){
	transport.sendMail(password_message(req.params.mail,req.params.password), function(err){
	    if(err){
	        res.json({status:0,message:'error',error:err})
	        console.log(err.message);
	        return;
	    }
	    console.log('Message sent successfully!');
	    res.json({status:1,message:'mail sent',error:0});
	    // if you don't want to use this transport object anymore, uncomment following line
	    //transport.close(); // close the connection pool
	});
};
