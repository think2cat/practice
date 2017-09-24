<%
	Const ForAppending = 8
	Const Create = true
	Dim FSO
	DIM TS
	DIM MyFileName
	Dim strLog

	MyFileName = Server.MapPath("LogFile.htm")
	Set FSO = Server.CreateObject("Scripting.FileSystemObject")
	Set TS = FSO.OpenTextFile(MyFileName, ForAppending, Create)

	' Store all required values in strLog
	strLog = "<br><P><B>" & now & "</B> "
	strLog = strLog & Request.ServerVariables("REMOTE_ADDR") & " "
	strLog = strLog & Request.ServerVariables("HTTP_REFERER") & " "
	strLog = strLog & Request.ServerVariables("HTTP_USER_AGENT") & "<BR>"
	strLog = strLog & Request.ServerVariables("HTTP_X_REWRITE_URL") & "<BR>"
	strLog = strLog & Request.ServerVariables("HTTP_URL") & "<BR>"
	strLog = strLog & Request.ServerVariables("ALL_HTTP") & "<BR>"
	' Write current information to Log Text File.
	TS.write strLog
	TS.Writeline ""
	' Create a session varialbe to check next time for ValidEntry
	Set TS = Nothing
	Set FSO = Nothing
%>