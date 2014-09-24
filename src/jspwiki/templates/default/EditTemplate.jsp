<%@ taglib uri="/WEB-INF/jspwiki.tld" prefix="wiki" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
        "http://www.w3.org/TR/html4/loose.dtd">

<HTML>

<HEAD>
  <TITLE><wiki:Variable var="ApplicationName" /> Edit: <wiki:PageName /></TITLE>
  <META NAME="ROBOTS" CONTENT="NOINDEX">
  
  <%@ include file="cssinclude.js" %>
</HEAD>

<!-- FIXME: I've sprinkled alot of CSS in the HTML; seperate into a stylesheet. -->
<BODY class="edit" BGCOLOR="#D9E8FF" onLoad="document.forms[1].text.focus()">

  <FORM id="wikiForm" name="wikiForm" style="width: 85%; margin-left: 10px;" 
  			action="<wiki:EditLink format="url" />" method="POST" 
            ACCEPT-CHARSET="<wiki:ContentEncoding />">
      <H1 CLASS="pagename" style="float: left;">Edit <wiki:PageName/></H1>
	  <span style="float: right; position: relative; top: 2em;">
	      <input type="submit" style="margin-right: 3em;" name="ok" value="Save" />
	      <input type="submit" name="cancel" id="cancel" value="Cancel" />
	  </span>
	  <HR style="clear: both;">
      <%-- These are required parts of this form.  If you do not include these,
           horrible things will happen.  Do not modify them either. --%>

      <%-- FIXME: This is not required, is it? --%>
      <INPUT type="hidden" name="page" id="page"     value="<wiki:PageName/>">
      <INPUT type="hidden" name="action"   value="save">
      <INPUT type="hidden" name="edittime" id="edittime" value="<%=pageContext.getAttribute("lastchange", PageContext.REQUEST_SCOPE )%>">

      <%-- End of required area --%>

      <TEXTAREA id="textToSave" CLASS="editor" wrap="virtual" name="text" rows="25" cols="80" style="width:100%;"><wiki:InsertPage mode="plain" /></TEXTAREA>
  </FORM>
</BODY>

</HTML>
