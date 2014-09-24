<%@ include file="/common/common.jspf" %>
<%@ include file="/common/head.jspf" %>

<form id="newPageForm" action="/new-page/doNewPage.jsp" method="GET">
    <table>
        <tr>
            <td>
                Page Name:
            </td>
            <td>
                <input type="text" name="pagename"/>
                <input type="hidden" name="domainname" value="${param.domainname}"/>
            </td>
        </tr>
        <tr>
            <td colspan="2" align="right">
                <input type="submit" value="Create Page"/>
            </td>
        </tr>
    </table>
</form>

<%@ include file="/common/tail.jspf" %>
