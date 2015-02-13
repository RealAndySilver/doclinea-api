var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport("SMTP", {
        service: 'Gmail',
        auth: {
            user: "support@iamstudio.co",
            pass: "watashiwa1"
        }
});

var message = function(subject,the_message,mail_address){
	//Esta función retorna el objeto necesario para el envío del email
		result={
			    from: 'Doclinea <recover@doclinea.com>',
			    to: '<'+mail_address+'>',
			    subject: subject,
			    headers: {
			        'X-Secure-level': 1000
			    },
			    text: the_message,
			    html:the_message
		    };
	   return result;
};
exports.send= function(subject,the_message,mail_address){
	//Esta función exporta la posibilidad de enviar un correo teniendo en cuenta 
	//los parámetros de entrada
	transport.sendMail(message(subject,the_message,mail_address), function(err){
	    if(err){
	        console.log(err.message);
	        return;
	    }
	    console.log('Message sent successfully to '+mail_address);
	});
};
