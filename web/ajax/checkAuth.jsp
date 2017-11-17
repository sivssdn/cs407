<%@ page language="java" contentType="application/json;charset=UTF-8"%>
<%@page trimDirectiveWhitespaces="true"%>
<%@ page import="com.google.api.client.auth.openidconnect.IdToken,com.google.api.client.googleapis.auth.oauth2.GoogleIdToken,com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier,com.google.api.client.http.javanet.NetHttpTransport,com.google.api.client.json.jackson2.JacksonFactory"%>
<%@ page import="org.json.JSONObject"%><%@ page import="java.util.Arrays"%>
<%
    JSONObject o = new JSONObject();

    try {
        String idTokenString = request.getParameter("id");
        // out.println (s);

        NetHttpTransport t = new NetHttpTransport();
        String CLIENT_ID = "159732235023-pfuhhf7c0np03pka47ohquhjpga7sla6.apps.googleusercontent.com";
        /*String CLIENT_ID = "447413120920-vc7i2j5a8lefvotflqlbfb7sm43cqtmf.apps.googleusercontent.com";*/
        JacksonFactory jf = new JacksonFactory();
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(t, jf)
        .setAudience(Arrays.asList(CLIENT_ID))
        // If you retrieved the token on Android using the Play Services 8.3 API or newer, set
        // the issuer to "https://accounts.google.com". Otherwise, set the issuer to
        // "accounts.google.com". If you need to verify tokens from multiple sources, build
        // a GoogleIdTokenVerifier for each issuer and try them both.
        .setIssuer("accounts.google.com")
        .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken != null) {
            IdToken.Payload payload = idToken.getPayload();

            // Print user identifier
            String userId = payload.getSubject();

            // Get profile information from payload
            String email = ((GoogleIdToken.Payload) payload).getEmail();
            boolean emailVerified = ((GoogleIdToken.Payload) payload).getEmailVerified();
            //String name = (String) payload.get("name");

            if (emailVerified) {

                if(email.split("@")[1].equals("ashoka.edu.in")){
                    /*LoginManager loginManager = new LoginManager();
                    String counsellorMail = loginManager.customerExists(email);
*/
                    session.setAttribute("email", email);
                    o.put ("status", 0);
                    o.put("redirectURL","selectCounsellor");
                    o.put ("email", email);

                    /*if(counsellorMail.length() > 0){    //existing user
                        session.setAttribute("email", email);
                        session.setAttribute("counsellor", counsellorMail);

                        o.put ("status", 0);
                        o.put("redirectURL","timeline");
                        o.put ("email", email);
                    }else if(counsellorMail.length() == 0){
                        session.setAttribute("email", email);
                        session.setAttribute("counsellor", "");

                        o.put ("status", 0);
                        o.put("redirectURL","selectCounsellor");
                        o.put ("email", email);
                    }else{
                        o.put("redirectURL","error.jsp?error=Something unexpected happened.");
                    }*/

                }else{

                    o.put("redirectURL","error.jsp?error=Please login using Ashoka email ID");
                }

            }

          // String pictureUrl = (String) payload.get("picture");
          // String locale = (String) payload.get("locale");
          // String familyName = (String) payload.get("family_name");
          // String givenName = (String) payload.get("given_name");

        } else {

            o.put ("status", 1);
            o.put ("error", "Invalid ID token.");
        }
    } catch (Throwable e) {

        o.put ("status", 1);
        o.put ("error", e.toString());
    }

    out.println(o.toString());
%>