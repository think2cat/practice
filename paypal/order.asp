<!-- #include file="config.asp"-->
<%
'response.ContentType = "text/xml"

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
sendXML = sendXML + "		<SetExpressCheckoutReq xmlns=""urn:ebay:api:PayPalAPI"">" & vbCrlf
sendXML = sendXML + "			<SetExpressCheckoutRequest xsi:type=""ns:SetExpressCheckoutRequestType"">" & vbCrlf
sendXML = sendXML + "			<Version xmlns=""urn:ebay:apis:eBLBaseComponents"" xsi:type=""xsd:string"">1.0</Version>" & vbCrlf
sendXML = sendXML + "				<SetExpressCheckoutRequestDetails xmlns=""urn:ebay:apis:eBLBaseComponents"">" & vbCrlf
sendXML = sendXML + "					<OrderTotal xmlns=""urn:ebay:apis:eBLBaseComponents"" currencyID=""USD"" xsi:type=""cc:BasicAmountType"">$OrderTotal$</OrderTotal>" & vbCrlf
sendXML = sendXML + "					<OrderDescription>" & Now() & "</OrderDescription>" & vbCrlf
sendXML = sendXML + "					<ReturnURL xsi:type=""xsd:string"">$ReturnURL$</ReturnURL>" & vbCrlf
sendXML = sendXML + "					<CancelURL xsi:type=""xsd:string"">$CancelURL$</CancelURL>" & vbCrlf
sendXML = sendXML + "				</SetExpressCheckoutRequestDetails>" & vbCrlf
sendXML = sendXML + "			</SetExpressCheckoutRequest>" & vbCrlf
sendXML = sendXML + "			<PaymentAction>Sale</PaymentAction>" & vbCrlf
sendXML = sendXML + "		</SetExpressCheckoutReq>" & vbCrlf
sendXML = sendXML + "	</SOAP-ENV:Body>" & vbCrlf
sendXML = sendXML + "</SOAP-ENV:Envelope>"


session("OrderTotal") = OrderTotal

sendXML = Replace(sendXML,"$OrderTotal$",OrderTotal)
sendXML = Replace(sendXML,"$ReturnURL$",ReturnURL)
sendXML = Replace(sendXML,"$CancelURL$",CancelURL)

'response.write "paypalSOAP:" & paypalSOAP & "<br/>" & vbCrlf
'response.write "OrderTotal:" & OrderTotal & "<br/>" & vbCrlf
'response.write "ReturnURL:" & ReturnURL & "<br/>" & vbCrlf
'response.write "CancelURL:" & CancelURL & "<br/>" & vbCrlf
'response.write "==========" & "<br/>" & vbCrlf & Replace(Replace(Replace(sendXML,"<","&lt;"),">","&gt;"),vbCrlf,"<br/>") & "<br/>" & vbCrlf & "==========" & "<br/>" & vbCrlf

returnMsg = sendSOAP(paypalSOAP,sendXML)


If InStr(returnMsg,"<Ack xmlns=""urn:ebay:apis:eBLBaseComponents"">Success</Ack>") > 0 Then
	token = getStr(returnMsg,"<Token xsi:type=""ebl:ExpressCheckoutTokenType"">","</Token>")
	redirectUrl = expressCheckoutResponseUrl + token
	%>Order Total : <%=OrderTotal%><br />Token : <%=token%><br /><a href="<%=redirectUrl%>">click here to continue, jump to paypal!<%
Else
	response.ContentType = "text/xml"
	response.write returnMsg
End if



%>
