package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"cloud.google.com/go/firestore"
	"github.com/schwarmco/go-cartesian-product"
	"golang.org/x/oauth2/google"
	iotcore "google.golang.org/api/cloudiot/v1"
)

type settings struct {
	Upper int32 `firestore:"upper"`
	Lower int32 `firestore:"lower"`
}
type device struct {
	ID      string   `firestore:"deviceId"`
	Name    string   `firestore:"deviceNickname"`
	Setting settings `firestore:"setting"`
	Owner   string   `firestore:"uid"`
}

type config struct {
	ID      string   `firestore:"deviceId"`
	Name    string   `firestore:"deviceNickname"`
	Setting settings `firestore:"setting"`
	Claimed bool     `firestore:"claimed"`
}

var users = []string{
	"jhGxLax0qvafND5SHbvQSOCU1Z62", // zoli google.com
	"it3blRoG4AfPw4hTdxaF3k2g0Kq1", // preston gmail
	"gfgmgdTLDaXy5PgrbpLyHHAzW6r2", // ptone gcp.solutions
	"RkDxabMGujhdYP5WGKShGWXAMZ73", // ptone google.com
}

// GetProject iterates over common env vars to get the Google Cloud project id
func GetProject() (projectID string) {
	var exists bool
	envCandidates := []string{
		"GCP_PROJECT",
		"GOOGLE_CLOUD_PROJECT",
		"GCLOUD_PROJECT",
	}
	for _, e := range envCandidates {
		projectID, exists = os.LookupEnv(e)
		if exists {
			return projectID
		}
	}
	if !exists {
		log.Fatalf("Set project ID via one of the supported env variables.")
	}
	return ""
}

func GetFirestoreClient() (fClient *firestore.Client) {
	projectID := GetProject()
	ctx := context.Background()
	var err error

	fClient, err = firestore.NewClient(ctx, projectID)
	if err != nil {
		log.Fatalf("Cannot create Firestore client: %v", err)
	}
	return fClient
}

// getClient returns a client based on the environment variable GOOGLE_APPLICATION_CREDENTIALS
func getClient() (*iotcore.Service, error) {
	// Authorize the client using Application Default Credentials.
	// See https://g.co/dv/identity/protocols/application-default-credentials
	ctx := context.Background()
	httpClient, err := google.DefaultClient(ctx, iotcore.CloudPlatformScope)
	if err != nil {
		return nil, err
	}
	client, err := iotcore.New(httpClient)
	if err != nil {
		return nil, err
	}

	return client, nil
}

func createDevice(projectID string, region string, registryID string, deviceID string) (*iotcore.Device, error) {
	client, err := getClient()
	if err != nil {
		return nil, err
	}

	/*
	   -----BEGIN EC PRIVATE KEY-----
	   MHcCAQEEIKuwAWhwcQTkjebGLdR34M62UYh7xY4bXa2Z/WW/wjhjoAoGCCqGSM49
	   AwEHoUQDQgAEEZvYnt8Tjyx17kgt9jGPTYUdJhGebzWBVCACTemsVD0Ve3T9fuIn
	   dOi5Rilz7x01IYUS7mgb4GT3BsTXP/DIGQ==
	   -----END EC PRIVATE KEY-----
	*/

	key := `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEEZvYnt8Tjyx17kgt9jGPTYUdJhGe
bzWBVCACTemsVD0Ve3T9fuIndOi5Rilz7x01IYUS7mgb4GT3BsTXP/DIGQ==
-----END PUBLIC KEY-----
`

	fmt.Printf(key)
	device := iotcore.Device{
		Id: deviceID,
		Credentials: []*iotcore.DeviceCredential{
			{
				PublicKey: &iotcore.PublicKeyCredential{
					Format: "ES256_PEM",
					Key:    string(key),
				},
			},
		},
	}

	parent := fmt.Sprintf("projects/%s/locations/%s/registries/%s", projectID, region, registryID)
	response, err := client.Projects.Locations.Registries.Devices.Create(parent, &device).Do()

	if err != nil {
		return nil, err
	}

	fmt.Printf("Successfully created ES256 device: %s\n", deviceID)
	return response, nil
}

func makeSpecialDevice() {
	ctx := context.Background()
	c := GetFirestoreClient()

	// receive products through channel
	dID := "a7xub"

	// createDevice("iot-end-user-demo", "us-central1", "end-user-demo", dID)

	dev := &device{
		ID:   dID,
		Name: dID,
		Setting: settings{
			Upper: 60,
			Lower: -60,
		},
		Owner: "",
	}
	conf := &config{
		ID:   dID,
		Name: dID,
		Setting: settings{
			Upper: 60,
			Lower: -60,
		},
		Claimed: false,
	}
	c.Collection("devices").Doc(dID).Set(ctx, dev)
	c.Collection("device-configs").Doc(dID).Set(ctx, conf)
}

func main() {
	colors := []interface{}{"Red", "Blue", "Green", "Yellow"}
	tags := []interface{}{"A", "B", "C"}
	numv := []interface{}{"1", "23", "54", "78", "39", "11"}
	cart := cartesian.Iter(colors, tags, numv)

	ctx := context.Background()
	c := GetFirestoreClient()

	// receive products through channel
	i := 0
	for product := range cart {
		break
		// fmt.Println(product)
		dID := fmt.Sprintf("Device-%s%s%s", product...)
		// fmt.Println(dID)

		// createDevice("iot-end-user-demo", "us-central1", "end-user-demo", dID)

		dev := &device{
			ID:   dID,
			Name: dID,
			Setting: settings{
				Upper: 60,
				Lower: -60,
			},
			Owner: users[i%4],
		}
		conf := &config{
			ID:   dID,
			Name: dID,
			Setting: settings{
				Upper: 60,
				Lower: -60,
			},
			Claimed: true,
		}
		c.Collection("devices").Doc(dID).Set(ctx, dev)
		c.Collection("device-configs").Doc(dID).Set(ctx, conf)
		fmt.Println(users[i%4])
		i++

	}
	makeSpecialDevice()
}
