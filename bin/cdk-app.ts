import cdk = require("@aws-cdk/core");
import { TrainingStack } from "../lib/stacks/training";
const app: cdk.App = new cdk.App();

new TrainingStack(app, "CdkTrainingStackForYourName", {
    env: { region: "us-west-2" },
});

app.synth();
