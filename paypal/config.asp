<%
Response.Charset = "UTF-8"
'Response.Buffer = False

Const paypalSOAP = "https://api-3t.sandbox.paypal.com/2.0"

Const expressCheckoutResponseUrl = "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token="

Const DEF_apiUsername = "gavin2_1207532001_biz_api1.hotmail.com"
Const DEF_apiPassword = "1207532006"
Const DEF_apiSignature = "Aso6eAHtK.u4X1Ms278RVyHgjMgjA4yQCWKhirsyju7QeGBLV0-b2cb-"


Dim OrderTotal, ReturnURL, CancelURL
OrderTotal = Minute(Now()) & ".00"
ReturnURL = "http://www.21ido.com/paypal/returnorder.asp"
CancelURL = "http://www.21ido.com/paypal/cancelorder.asp"



'------------------------------公用函数-----------------------------------

Function sendSOAP(url,xml)
	Dim cnc_objXML
	Set cnc_objXML = Server.CreateObject("MSXML2.XMLHTTP")
	cnc_objXML.open "POST",url,False
	cnc_objXML.setRequestHeader "Content-Type", "text/xml; charset=utf-8"
'	cnc_objXML.setRequestHeader "SOAPAction", action
	cnc_objXML.send xml

	Dim retStr
	If Err.Number = 0 Then
		retStr = cnc_objXML.responseText
	else
		retStr = "error"
	End If

	Set xmlHttp = Nothing
	sendSOAP = retStr

End Function


Function getStr(str,str1,str2)
	if isNull(str1) then str1 = ""
	if isNull(str2) then str2 = ""
	pStart = instr(str,str1) + len(str1)
	if pStart > 0 Then
		pEnd = instr(pStart,str,str2)
		if str2 = "" Then
			getStr = mid(str,pStart)
		elseif pEnd > 0 Then
			getStr = mid(str,pStart,pEnd - pStart)
		else
			getStr = mid(str,pStart)
		end if
	else
		pEnd = instr(str,str2)
		if pEnd > 0 then
			getStr = mid(str,0,pEnd - len(str))
		else
			getStr = getStr
		end if
	end If
	'getStr = Trim(getStr)
	'Response.Write getStr & "<br/>" & VbCrLf
end Function

%>