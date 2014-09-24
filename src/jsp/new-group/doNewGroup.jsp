<%@ include file="/common/common.jspf" %>

groupname: ${param.groupname}<br>

${paperairplane:newGroup(param.groupname)}

<c:redirect url="http://${param.groupname}"/>
