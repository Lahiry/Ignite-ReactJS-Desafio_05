import { useEffect } from "react";

export default function Comments() {

  useEffect(() => {
      let script = document.createElement("script");
      let anchor = document.getElementById("inject-comments-for-utterances");
      script.setAttribute("src", "https://utteranc.es/client.js");
      script.setAttribute("crossorigin","anonymous");
      script.setAttribute("async", 'true');
      script.setAttribute("repo", process.env.NEXT_PUBLIC_UTTERANC_GITHUB_REPO);
      script.setAttribute("issue-term", "pathname");
      script.setAttribute( "theme", "photon-dark");
      anchor.appendChild(script);
  }, [])

  return (
      <div id="inject-comments-for-utterances"></div>
  );
}