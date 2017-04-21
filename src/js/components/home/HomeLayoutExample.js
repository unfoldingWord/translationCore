

<HomeContainer>
  <LicenseModal />
  <WelcomeSplash />
  <MainContainer>
    <StepperContainer>
      <HomeButton />
      <Stepper />
    </StepperContainer>
    <InstructionsComponent>
    </InstructionsComponent>
    <DisplayContainer>
      <HomeScreenContainer> {/* we must change this name */}
        <UserInfoCard />
        <ProjectInfoCard />
        <ToolInfoCard />
      </HomeScreenContainer>
      <UserSelectionContainer>{/* we must change this name */}
        <LoginContainer>
          <LoginD43>
            <CreateDialog />
          </LoginD43>
          <LoginOffline />
        </LoginContainer>
      </UserSelectionContainer>
      <ProjectSelectionContainer> {/* we must change this name */}
        <MyProjects>
          <SortMenu />
          <Projects>
            <Project>
              <Upload /> {/* i think this is functionality/ action rather than component*/}
              <Export /> {/* i think this is functionality/ action rather than component*/}
            </Project>
          </Projects>
        </MyProjects>
        <ProjectsFAB />
        <OnlineImportModal>
          <SearchBar />
          <SearchResults />
        </OnlineImportModal>
      </ProjectSelectionContainer>
      <ToolSelectionContainer> {/* we must change this name */}
        <ToolsCards /> {/* already built somewhere else */}
      </ToolSelectionContainer>
    </DisplayContainer>
    <Navigation /> {/* we forgot to add the go back and continue buttons*/}
  </MainContainer>
</HomeContainer>
