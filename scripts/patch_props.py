import os

path = r"D:\myproject\new\oasis-shell\src\App.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Pass systemStats to TopBar
old_topbar = """        <TopBar
          activeVenture={activeVenture}
          activeContext={activeContext}
          contexts={contexts}
          zenMode={zenMode}
          voiceActive={voiceActive}
          autoAura={autoAura}
          ventureIntegrity={ventureIntegrity}
          fiscalBurn={fiscalBurn}
          hardwareStatus={hardwareStatus}
          displayedMarket={displayedMarket}
          lastSync={lastSync}
          presentationMode={presentationMode}
          showCLI={showCLI}
          onOpenSentinel={() => setShowSentinel(true)}
          onVoiceIntent={handleVoiceIntent}
          onToggleZen={() => setZenMode(!zenMode)}
          onToggleCLI={() => setShowCLI(!showCLI)}
          onTogglePresentation={() => setPresentationMode(!presentationMode)}
          onToggleNetwork={() => setShowNetwork(!showNetwork)}
          onToggleAutoAura={() => setAutoAura(!autoAura)}
          onAegisSync={handleAegisSync}
          onOpenNexus={() => setShowNexus(true)}
        />"""

new_topbar = """        <TopBar
          activeVenture={activeVenture}
          activeContext={activeContext}
          systemStats={systemStats}
          contexts={contexts}
          zenMode={zenMode}
          voiceActive={voiceActive}
          autoAura={autoAura}
          ventureIntegrity={ventureIntegrity}
          fiscalBurn={fiscalBurn}
          hardwareStatus={hardwareStatus}
          displayedMarket={displayedMarket}
          lastSync={lastSync}
          presentationMode={presentationMode}
          showCLI={showCLI}
          onOpenSentinel={() => setShowSentinel(true)}
          onVoiceIntent={handleVoiceIntent}
          onToggleZen={() => setZenMode(!zenMode)}
          onToggleCLI={() => setShowCLI(!showCLI)}
          onTogglePresentation={() => setPresentationMode(!presentationMode)}
          onToggleNetwork={() => setShowNetwork(!showNetwork)}
          onToggleAutoAura={() => setAutoAura(!autoAura)}
          onAegisSync={handleAegisSync}
          onOpenNexus={() => setShowNexus(true)}
        />"""

content = content.replace(old_topbar.strip(), new_topbar.strip())

# Update LeftRail for spatial switching
old_leftrail = """      <LeftRail
        presentationMode={presentationMode}
        simMode={simMode}
        onDash={() => handleContextSwitch("dev")}
        onOpenGraph={() => setShowGraph(true)}
        onOpenVault={() => setShowVault(true)}
        onOpenLogs={() => setShowLogs(true)}
        onActivateSim={() => setSimMode(true)}
        onToggleSim={() => setSimMode(!simMode)}
        onOpenSettings={() => setShowSettings(!showSettings)}
        chronosIndex={chronosIndex}
        chronosCount={chronosLedger.length}
        onChronosChange={handleChronosSliderChange}
        onJumpToPresent={() => setChronosIndex(chronosLedger.length - 1)}
      />"""

new_leftrail = """      <LeftRail
        presentationMode={presentationMode}
        simMode={simMode}
        activeView={activeView}
        onViewChange={(v: any) => setActiveView(v)}
        onDash={() => handleContextSwitch("dev")}
        onOpenGraph={() => setShowGraph(true)}
        onOpenVault={() => setShowVault(true)}
        onOpenLogs={() => setShowLogs(true)}
        onActivateSim={() => setSimMode(true)}
        onToggleSim={() => setSimMode(!simMode)}
        onOpenSettings={() => setShowSettings(!showSettings)}
        chronosIndex={chronosIndex}
        chronosCount={chronosLedger.length}
        onChronosChange={handleChronosSliderChange}
        onJumpToPresent={() => setChronosIndex(chronosLedger.length - 1)}
      />"""

content = content.replace(old_leftrail.strip(), new_leftrail.strip())

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Props patched.")
