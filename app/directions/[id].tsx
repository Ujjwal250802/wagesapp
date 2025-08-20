import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase-config";
import { ArrowLeft, Navigation, Clock, MapPin } from "lucide-react-native"; // icons

export default function Directions() {
  const params = useLocalSearchParams();
  const jobId = typeof params.id === "string" ? params.id : params.id?.[0];

  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      try {
        const jobDoc = await getDoc(doc(db, "jobs", jobId));
        if (jobDoc.exists()) {
          setJob(jobDoc.data());
        }
      } catch (error) {
        console.error("Error fetching job:", error);
      }
    };

    fetchJob();
  }, [jobId]);

  if (!job) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading job details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ArrowLeft size={24} color="black" />
      </TouchableOpacity>

      {/* Job Title */}
      <Text style={styles.title}>{job.title || "Job Details"}</Text>

      {/* Organization */}
      {job.organizationName && (
        <View style={styles.row}>
          <MapPin size={20} color="gray" />
          <Text style={styles.text}>{job.organizationName}</Text>
        </View>
      )}

      {/* Location */}
      {job.location && (
        <View style={styles.row}>
          <Navigation size={20} color="gray" />
          <Text style={styles.text}>{job.location}</Text>
        </View>
      )}

      {/* Duration */}
      {job.duration && (
        <View style={styles.row}>
          <Clock size={20} color="gray" />
          <Text style={styles.text}>{job.duration}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loading: {
    fontSize: 16,
    fontWeight: "500",
    color: "gray",
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    marginLeft: 8,
  },
});
