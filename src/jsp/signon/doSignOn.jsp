<%@ include file="/common/common.jspf" %>

<%-- FIXME: Get these constants out of here and into a centralized place --%>
${paperairplane:signOn("PaperAirplane", "PaperAirplanePassword")}
${paperairplane:startP2PServices(8081)}