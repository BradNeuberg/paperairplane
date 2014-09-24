<%@ include file="/common/common.jspf" %>
<%@ include file="/common/head.jspf" %>

<form action="doSignOn.jsp" method="post">
    <table>
        <tr>
            <td>
                Username:
            </td>
            <td>
                <input type="text" name="username" value="${param.username}"/>
            </td>
        </tr>
        <tr>
            <td>
                Password:
            </td>
            <td>
                <input type="password" name="password" value="${param.password}"/>
            </td>
        </tr>
        <tr>
            <td colspan="2" align="right">
                <input type="submit" value="Sign On"/>
            </td>
        </tr>
    </table>
</form>

<%@ include file="/common/tail.jspf" %>
