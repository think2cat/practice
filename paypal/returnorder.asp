<!-- #include file="config.asp"-->
<%

'?token=EC-5JS335772C3726312&PayerID=WS8QWH5MLUK6C

Token = request("Token")
PayerID = request("PayerID")

session("Token") = Token
session("PayerID") = PayerID

sendXML = ""
sendXML = sendXML + "<?xml version=""1.0"" encoding=""UTF-8""?>" & vbCrlf
sendXML = sendXML + "<SOAP-ENV:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance""" & vbCrlf
sendXML = sendXML + "	xmlns:SOAP-ENC=""http://schemas.xmlsoap.org/soap/encoding/""" & vbCrlf
sendXML = sendXML + "	xmlns:SOAP-ENV=""http://schemas.xmlsoap.org/soap/envelope/""" & vbCrlf
sendXML = sendXML + "	xmlns:xsd=""http://www.w3.org/2001/XMLSchema""" & vbCrlf
sendXML = sendXML + "	SOAP-ENV:encodingStyle=""http://schemas.xmlsoap.org/soap/encoding/"">" & vbCrlf
sendXML = sendXML + "	<SOAP-ENV:Header>" & vbCrlf
sendXML = sendXML + "		<RequesterCredentials xmlns=""urn:ebay:api:PayPalAPI"">" & vbCrlf
sendXML = sendXML + "			<Credentials xmlns=""urn:ebay:apis:eBLBaseComponents"">" & vbCrlf
sendXML = sendXML + "				<Username>" & DEF_apiUsername & "</Username>" & vbCrlf
sendXML = sendXML + "				<Password>" & DEF_apiPassword & "</Password>" & vbCrlf
sendXML = sendXML + "				<Signature>" & DEF_apiSignature & "</Signature>" & vbCrlf
sendXML = sendXML + "				<Subject/>" & vbCrlf
sendXML = sendXML + "			</Credentials>" & vbCrlf
sendXML = sendXML + "		</RequesterCredentials>" & vbCrlf
sendXML = sendXML + "	</SOAP-ENV:Header>" & vbCrlf
sendXML = sendXML + "	<SOAP-ENV:Body>" & vbCrlf
sendXML = sendXML + "		<GetExpressCheckoutDetailsReq xmlns=""urn:ebay:api:PayPalAPI"">" & vbCrlf
sendXML = sendXML + "			<GetExpressCheckoutDetailsRequest xsi:type=""ns:SetExpressCheckoutRequestType"">" & vbCrlf
sendXML = sendXML + "				<Version xmlns=""urn:ebay:apis:eBLBaseComponents"" xsi:type=""xsd:string"">1.0</Version>" & vbCrlf
sendXML = sendXML + "				<Token>" & token & "</Token>" & vbCrlf
sendXML = sendXML + "			</GetExpressCheckoutDetailsRequest>" & vbCrlf
sendXML = sendXML + "		</GetExpressCheckoutDetailsReq>" & vbCrlf
sendXML = sendXML + "	</SOAP-ENV:Body>" & vbCrlf
sendXML = sendXML + "</SOAP-ENV:Envelope>"



'response.write "paypalSOAP:" & paypalSOAP & "<br/>" & vbCrlf
'response.write "OrderTotal:" & OrderTotal & "<br/>" & vbCrlf
'response.write "ReturnURL:" & ReturnURL & "<br/>" & vbCrlf
'response.write "CancelURL:" & CancelURL & "<br/>" & vbCrlf
'response.write "==========" & "<br/>" & vbCrlf & Replace(Replace(Replace(sendXML,"<","&lt;"),">","&gt;"),vbCrlf,"<br/>") & "<br/>" & vbCrlf & "==========" & "<br/>" & vbCrlf
'response.ContentType = "text/xml":response.write sendXML:response.end

returnMsg = sendSOAP(paypalSOAP,sendXML)


If InStr(returnMsg,"<Ack xmlns=""urn:ebay:apis:eBLBaseComponents"">Success</Ack>") > 0 Then
	returnMsg = getStr(returnMsg,"</Token>","</Address>")
	returnMsg = Replace(returnMsg,"</",vbCrlf & "</")
	Do While InStr(returnMsg,"<") > 0
		returnMsg = Replace(returnMsg,"<" & getStr(returnMsg,"<",">") & ">","")
		returnMsg = Replace(returnMsg,vbCrlf & vbCrlf, vbCrlf)
	Loop
	returnMsg = Replace(returnMsg,vbCrlf,"<br />")
	response.write returnMsg & "<br/><br/>"

	'response.write "Dear " & getStr(returnMsg,"<Payer xsi:type=""ebl:EmailAddressType"">","</Payer>") & "<br/>"
	%><a href="complateorder.asp">click here to complate the order!</a><%
Else
	response.ContentType = "text/xml"
	response.write returnMsg
End if



%>