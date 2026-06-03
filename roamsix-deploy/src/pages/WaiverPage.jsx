import LegalPage from "./LegalPage";

export default function WaiverPage() {
  return (
    <LegalPage title="Assumption of Risk and Participant Agreement" lastUpdated="June 2026">

      <div className="lp-section">
        <h2 className="lp-section-title">Voluntary Participation</h2>
        <p>
          I understand and acknowledge that my participation in any ROAMSIX event is entirely voluntary. I freely choose to participate and understand that I may withdraw at any time, subject to the applicable cancellation and refund policies.
        </p>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">Physical Activity Risk</h2>
        <p>
          ROAMSIX events may include guided outdoor challenges, movement sessions, hiking, breathwork, physical exercise, recovery activities, and other forms of exertion. I understand that physical activity carries inherent risk of injury, fatigue, muscle strain, cardiovascular stress, and other physical and medical consequences.
        </p>
        <p>
          I confirm that I am in adequate physical health to participate in the activities included in the event I have registered for. I accept full responsibility for my own physical condition and participation decisions.
        </p>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">Outdoor and Terrain Risk</h2>
        <p>
          ROAMSIX events take place on private land and outdoor environments that may include uneven ground, hills, loose terrain, rocks, natural obstacles, vegetation, steep grades, and other features not found in controlled indoor settings. I understand and accept the following risks:
        </p>
        <ul>
          <li>Trips, slips, and falls on uneven, wet, or unstable surfaces</li>
          <li>Reduced visibility during early morning, evening, or night activities</li>
          <li>Physical exertion at elevations or in terrain conditions that differ from my typical environment</li>
          <li>Contact with natural materials including plants, soil, and rocks</li>
          <li>Distance from emergency medical services in outdoor or rural settings</li>
        </ul>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">Weather and Environmental Risk</h2>
        <p>
          Outdoor events are subject to weather conditions including but not limited to heat, sun exposure, cold temperatures, wind, rain, and rapid environmental changes. Associated risks include:
        </p>
        <ul>
          <li>Heat exhaustion or heat stroke from sun exposure or physical activity</li>
          <li>Dehydration and electrolyte imbalance</li>
          <li>Hypothermia from cold temperatures or wind</li>
          <li>Exposure to insects, wildlife, or plant irritants</li>
          <li>Altitude-related effects if applicable to the venue</li>
        </ul>
        <p>
          I agree to bring appropriate clothing, hydration, and personal supplies for outdoor conditions and to notify event staff immediately if I experience any physical distress.
        </p>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">Recovery and Wellness Activities</h2>
        <p>
          Some ROAMSIX events may include optional or guided recovery modalities such as breathwork, cold exposure, stretching, meditation, or other wellness-oriented activities. These activities are provided for educational and experiential purposes only. I understand that these activities carry their own inherent risks and I choose to participate voluntarily. I will immediately communicate any discomfort or distress to event staff.
        </p>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">Food and Allergy Risk</h2>
        <p>
          ROAMSIX events may include chef-prepared meals and food service. I understand that food may be prepared in environments where common allergens are present, including nuts, dairy, gluten, shellfish, eggs, and other ingredients. I accept responsibility for communicating all food allergies and dietary restrictions prior to the event and for managing my own food safety decisions on the day of the event.
        </p>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">Medical Fitness to Participate</h2>
        <p>
          I represent that I am in good physical health and have no known medical condition that would prevent my safe participation in a ROAMSIX event. If I have any medical conditions, injuries, or concerns that may affect my participation, I agree to consult a qualified healthcare provider before attending and to disclose relevant information in my Participant Intake Form.
        </p>
        <p>
          Nothing provided by ROAMSIX, its staff, or facilitators constitutes medical advice, diagnosis, or treatment. ROAMSIX does not provide medical supervision.
        </p>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">Emergency Medical Authorization</h2>
        <p>
          In the event of an emergency where I am unable to communicate, I authorize ROAMSIX staff to seek emergency medical assistance on my behalf and to provide emergency responders with any medical information I have disclosed to ROAMSIX. I understand that ROAMSIX is not a medical provider and that any such authorization is limited to facilitating access to emergency services.
        </p>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">Release of Liability</h2>
        <p>
          To the fullest extent permitted by the laws of the State of California, I hereby release, waive, discharge, and covenant not to sue ROAMSIX, Reciprofy Inc., their owners, officers, employees, contractors, facilitators, vendors, and agents from any and all claims, demands, losses, costs, damages, or causes of action arising out of or related to my participation in any ROAMSIX event, including but not limited to claims resulting from personal injury, death, property loss, negligence, or other causes.
        </p>
        <p>
          I acknowledge that this release is intended to be as broad and inclusive as permitted by California law, and that if any portion of this release is found unenforceable, the remaining portions shall continue in full force and effect.
        </p>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">Agreement to Follow Staff Instructions</h2>
        <p>
          I agree to follow all instructions provided by ROAMSIX staff, facilitators, and on-site personnel at all times during the event. I understand that failure to follow instructions may result in removal from the event without refund.
        </p>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">Personal Belongings</h2>
        <p>
          I am responsible for the safety and security of all personal property I bring to a ROAMSIX event. ROAMSIX is not responsible for lost, stolen, or damaged personal belongings.
        </p>
      </div>

      <div className="lp-section">
        <h2 className="lp-section-title">Third-Party Providers</h2>
        <p>
          ROAMSIX events may involve third-party vendors, service providers, instructors, and facilitators. I acknowledge that ROAMSIX is not responsible for the acts or omissions of third-party providers and that participation in any third-party activity is voluntary and subject to its own associated risks.
        </p>
      </div>

      <div className="lp-contact">
        <div className="lp-contact-label">Questions</div>
        <p>
          Contact us at <a href="mailto:info@roamsix.com">info@roamsix.com</a> with any questions about this agreement before registering for an event.
        </p>
      </div>

    </LegalPage>
  );
}
