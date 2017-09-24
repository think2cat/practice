<!-- #include file="config.asp"-->
<%
OrderTotal = session("OrderTotal")
If OrderTotal = "" Then response.write "session miss":response.end


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
sendXML = sendXML + "		<GetTransactionDetailsReq xmlns=""urn:ebay:api:PayPalAPI"">" & vbCrlf
sendXML = sendXML + "			<GetTransactionDetailsRequest xsi:type=""ns:SetExpressCheckoutRequestType"">" & vbCrlf
sendXML = sendXML + "			<Version xmlns=""urn:ebay:apis:eBLBaseComponents"" xsi:type=""xsd:string"">1.0</Version>" & vbCrlf
sendXML = sendXML + "				<GetTransactionDetailsRequestDetails xmlns=""urn:ebay:apis:eBLBaseComponents"">" & vbCrlf
sendXML = sendXML + "					<TransactionID>0RF063021H730671C</TransactionID>" & vbCrlf
sendXML = sendXML + "				</GetTransactionDetailsRequestDetails>" & vbCrlf
sendXML = sendXML + "			</GetTransactionDetailsRequest>" & vbCrlf
sendXML = sendXML + "		</GetTransactionDetailsReq>" & vbCrlf
sendXML = sendXML + "	</SOAP-ENV:Body>" & vbCrlf
sendXML = sendXML + "</SOAP-ENV:Envelope>"



'response.write "paypalSOAP:" & paypalSOAP & "<br/>" & vbCrlf
'response.write "OrderTotal:" & OrderTotal & "<br/>" & vbCrlf
'response.write "ReturnURL:" & ReturnURL & "<br/>" & vbCrlf
'response.write "CancelURL:" & CancelURL & "<br/>" & vbCrlf
'response.write "==========" & "<br/>" & vbCrlf & Replace(Replace(Replace(sendXML,"<","&lt;"),">","&gt;"),vbCrlf,"<br/>") & "<br/>" & vbCrlf & "==========" & "<br/>" & vbCrlf
'response.ContentType = "text/xml":response.write sendXML:response.end

returnMsg = sendSOAP(paypalSOAP,sendXML)


If InStr(returnMsg,"a<Ack xmlns=""urn:ebay:apis:eBLBaseComponents"">Success</Ack>") > 0 Then
	response.write "TransactionID: " & getStr(returnMsg,"<TransactionID>","</TransactionID>") & "<br />"
	response.write "PaymentDate: " & getStr(returnMsg,"<PaymentDate xsi:type=""xs:dateTime"">","</PaymentDate>") & "<br />"
	response.write "GrossAmount: USD " & getStr(returnMsg,"<GrossAmount xsi:type=""cc:BasicAmountType"" currencyID=""USD"">","</GrossAmount>") & "<br />"
	response.write "FeeAmount: USD " & getStr(returnMsg,"<FeeAmount xsi:type=""cc:BasicAmountType"" currencyID=""USD"">","</FeeAmount>") & "<br />"
	response.write "TaxAmount: USD " & getStr(returnMsg,"<TaxAmount xsi:type=""cc:BasicAmountType"" currencyID=""USD"">","</TaxAmount>") & "<br />"
	response.write "<font color=red>PaymentStatus: " & getStr(returnMsg,"<PaymentStatus xsi:type=""ebl:PaymentStatusCodeType"">","</PaymentStatus>") & "</font>"
Else
	response.ContentType = "text/xml"
	response.write returnMsg
End if

%>