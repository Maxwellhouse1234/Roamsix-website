{/* Team Info */}
            <section className="space-y-4">
              <h2 className="text-2xl font-light tracking-wide text-gray-300 border-b border-gray-800 pb-3" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                Team Information
              </h2>
              
              <input
                type="text"
                placeholder="TEAM NAME *"
                required
                value={formData.teamName}
                onChange={(e) => handleChange('teamName', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
              />
            </section>

            {/* Coach Info */}
            <section className="space-y-4">
              <h2 className="text-2xl font-light tracking-wide text-gray-300 border-b border-gray-800 pb-3" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                Coach Information
              </h2>
              
              <input
                type="text"
                placeholder="COACH NAME *"
                required
                value={formData.coachName}
                onChange={(e) => handleChange('coachName', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
              />

              <input
                type="text"
                placeholder="CERTIFICATIONS (e.g., NASM-CPT, CrossFit L2) *"
                required
                value={formData.coachCertification}
                onChange={(e) => handleChange('coachCertification', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
              />

              <select
                required
                value={formData.coachShirtSize}
                onChange={(e) => handleChange('coachShirtSize', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide focus:outline-none transition-colors"
              >
                <option value="">COACH T-SHIRT SIZE *</option>
                {shirtSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </section>

            {/* Athletes */}
            <section className="space-y-4">
              <h2 className="text-2xl font-light tracking-wide text-gray-300 border-b border-gray-800 pb-3" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                Athletes (3 Clients)
              </h2>
              
              {[1, 2, 3].map(num => (
                <div key={num} className="space-y-3 bg-gray-900 border border-gray-800 p-4">
                  <p className="text-xs text-gray-500 tracking-wider">ATHLETE {num}</p>
                  <input
                    type="text"
                    placeholder={`ATHLETE ${num} NAME *`}
                    required
                    value={formData[`athlete${num}Name`]}
                    onChange={(e) => handleChange(`athlete${num}Name`, e.target.value)}
                    className="w-full bg-black border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                  />
                  <select
                    required
                    value={formData[`athlete${num}ShirtSize`]}
                    onChange={(e) => handleChange(`athlete${num}ShirtSize`, e.target.value)}
                    className="w-full bg-black border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide focus:outline-none transition-colors"
                  >
                    <option value="">T-SHIRT SIZE *</option>
                    {shirtSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              ))}
            </section>

            {/* Contact Info */}
            <section className="space-y-4">
              <h2 className="text-2xl font-light tracking-wide text-gray-300 border-b border-gray-800 pb-3" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                Contact Information
              </h2>
              
              <input
                type="email"
                placeholder="EMAIL *"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
              />

              <input
                type="tel"
                placeholder="PHONE *"
                required
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
              />
            </section>

            {/* Emergency Contacts */}
            <section className="space-y-4">
              <h2 className="text-2xl font-light tracking-wide text-gray-300 border-b border-gray-800 pb-3" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                Emergency Contacts
              </h2>
              
              <div className="space-y-3">
                <p className="text-xs text-gray-500 tracking-wider">EMERGENCY CONTACT 1</p>
                <input
                  type="text"
                  placeholder="NAME *"
                  required
                  value={formData.emergencyContact1Name}
                  onChange={(e) => handleChange('emergencyContact1Name', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                />
                <input
                  type="tel"
                  placeholder="PHONE *"
                  required
                  value={formData.emergencyContact1Phone}
                  onChange={(e) => handleChange('emergencyContact1Phone', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-500 tracking-wider">EMERGENCY CONTACT 2</p>
                <input
                  type="text"
                  placeholder="NAME *"
                  required
                  value={formData.emergencyContact2Name}
                  onChange={(e) => handleChange('emergencyContact2Name', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                />
                <input
                  type="tel"
                  placeholder="PHONE *"
                  required
                  value={formData.emergencyContact2Phone}
                  onChange={(e) => handleChange('emergencyContact2Phone', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                />
              </div>
            </section>

            {/* Waiver */}
            <section className="space-y-4">
              <h2 className="text-2xl font-light tracking-wide text-gray-300 border-b border-gray-800 pb-3" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                Waiver & Agreement
              </h2>
              
              <div className="bg-gray-900 border border-gray-700 p-6 max-h-64 overflow-y-auto text-sm text-gray-400 leading-relaxed">
                <h3 className="text-gray-300 font-medium mb-3">LIABILITY WAIVER & RELEASE</h3>
                <p className="mb-3">
                  I acknowledge that participating in Proving Grounds involves inherent risks including physical injury, and I voluntarily assume all such risks. I agree to release, waive, discharge, and hold harmless ROAMSIX, its founders, employees, and affiliates from any and all liability, claims, demands, or causes of action arising out of participation in this event.
                </p>
                <p className="mb-3">
                  I certify that I and my team members are physically fit and have no medical conditions that would prevent safe participation. I agree to follow all safety protocols and instructions provided by event staff.
                </p>
                <p>
                  By checking the box below, I acknowledge that I have read, understood, and agree to this waiver on behalf of my entire team.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.waiverAccepted}
                  onChange={(e) => handleChange('waiverAccepted', e.target.checked)}
                  className="mt-1 w-5 h-5 border-2 border-gray-600 bg-transparent checked:bg-gray-300 transition-colors"
                />
                <span className="text-gray-300 group-hover:text-gray-200 transition-colors">
                  I accept the liability waiver and release on behalf of my team *
                </span>
              </label>
            </section>

            {/* Submit */}
            <div className="pt-8 text-center">
              <button
                type="submit"
                className="bg-gray-200 hover:bg-white text-black py-5 px-12 text-sm tracking-[0.2em] uppercase transition-all duration-500"
              >
                Complete Registration
              </button>
              <p className="text-xs text-gray-600 mt-4">
                After registration, you'll be redirected to payment.
              </p>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Crimson+Text:wght@400;600&display=swap');
      `}</style>
    </div>
  );
}
