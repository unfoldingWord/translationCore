

<HomeContainer>
  <LicenseModal />
  <WelcomeSplash />
  <MainContainer>
    <StepperContainer>
      <Stepper />
    </StepperContainer>
    <Instructions>
    </Instructions>
    <DisplayContainer>
      <OverviewContainer>}
        <UserCard />
        <ProjectCard />
        <ToolCard />
      </OverviewContainer>
      <UsersManagementContainer>
        <Login>
          <LoginD43>
            <CreateDialog />
          </LoginD43>
          <LoginOffline />
        </Login>
      </UsersManagementContainer>
      <ProjectsManagementContainer>
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
      </ProjectsManagementContainer>
      <ToolsManagementContainer>
        <ToolsCards /> {/* already built somewhere else */}
      </ToolsManagementContainer>
    </DisplayContainer>
    <BackNavigation />
  </MainContainer>
</HomeContainer>



