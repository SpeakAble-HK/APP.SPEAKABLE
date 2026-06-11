import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PiPiPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/pirate-treasure-map", { replace: true }); }, [navigate]);
  return null;
}
