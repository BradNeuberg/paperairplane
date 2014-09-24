/** A file that follows the Proxy AutoConfiguration (PAC) format.
  * The function below filters based on domain name on whether to
  * use normal DNS or to use our special P2P web proxy to proxy requests
  * into the peer network. */

function FindProxyForURL(url, host)
{
	// see if we end with just two characters - those are reserved country codes
	var splitString = host.split("\.");
	var ending = splitString[splitString.length - 1];
	if (ending.length == 2) {
		return "DIRECT";
	}
	// check for other well-known endings
	else if (shExpMatch(host, "*.com")  || shExpMatch(host, "*.edu")    ||
			 shExpMatch(host, "*.gov")  || shExpMatch(host, "*.info")   ||
			 shExpMatch(host, "*.org")  || shExpMatch(host, "*.biz")    ||
			 shExpMatch(host, "*.coop") || shExpMatch(host, "*.aero")   ||
			 shExpMatch(host, "*.int")  || shExpMatch(host, "*.mil")    ||
			 shExpMatch(host, "*.name") || shExpMatch(host, "*.museum") ||
			 shExpMatch(host, "*.net")  || shExpMatch(host, "*.pro")) {
		return "DIRECT";
	}
	// make sure we aren't an IP address (todo: make this work for IPv6 addresses)
	else if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
		return "DIRECT";
	}
	// else we are a Paper Airplane address
	else {
		return "PROXY 127.0.0.1:8081";
	}
}
