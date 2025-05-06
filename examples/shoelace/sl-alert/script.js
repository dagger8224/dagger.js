export const load = (icons) =>
    Promise.all(
        ["sl-alert", "sl-button", "sl-select", "sl-switch"].map((tagName) =>
            customElements.whenDefined(tagName)
        )
    ).then(() => ({
        $toastAlertElement: null,
        icons: icons.map((icon) => icon.name),
        variant: "success",
        duration: "5000",
        open: false,
        closable: true,
        icon: "info-circle",
        htmlList: [
            `<strong>This is super informative</strong><br />
          You can tell by how pretty the alert is.`,
            `<strong>Your changes have been saved</strong><br />
          You can safely exit the app now.`,
            `<strong>Your settings have been updated</strong><br />
          Settings will take effect on next login.`,
            `<strong>Your session has ended</strong><br />
          Please login again to continue.`,
            `<strong>Your account has been deleted</strong><br />
          We're very sorry to see you go!`,
        ],
        html: "",
        eventType: "N/A",
    }));

export const updateEventType = ($event, $scope) => {
    $scope.eventType = $event.type;
};
