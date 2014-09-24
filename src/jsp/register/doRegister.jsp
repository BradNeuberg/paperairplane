<%@ include file="/common/common.jspf" %>

username: ${param.username}<br>
password: ${param.password}<br>

<c:set var="registerResults"
       value="${paperairplane:registerUser(param.username, param.password)}"/>
       
<c:choose>
    <c:when test="${registerResults}">
        ${paperairplane:startP2PServices(8081)}
    </c:when>
    <c:otherwise>
        We were not able to register you
    </c:otherwise>
</c:choose>
