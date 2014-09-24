<%@ include file="/common/common.jspf" %>
<%@ include file="/common/head.jspf" %>

<form action="doNewGroup.jsp" method="post">
    <table>
        <tr>
            <td>
                Site Name:
            </td>
            <td>
                <input type="text" name="groupname" value="${param.groupname}"/>
            </td>
        </tr>
        <tr>
            <td colspan="2" align="right">
                <input type="submit" value="Create Site"/>
            </td>
        </tr>
    </table>
</form>

<%@ include file="/common/tail.jspf" %>
