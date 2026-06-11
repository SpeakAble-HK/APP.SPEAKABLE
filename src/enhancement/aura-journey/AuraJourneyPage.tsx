import React from "react";
import { AuraJourneyExperience } from "./components/auraJourney/AuraJourneyExperience";

const AuraJourneyPage: React.FC = () => {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <AuraJourneyExperience />
    </div>
  );
};

export default AuraJourneyPage;
