import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Button, Linking, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";

// 1. 문서ID 스프레드시트에서 보드 목록을 불러오는 API (Google Apps Script로 구현 필요)
const BOARD_LIST_API = "https://script.google.com/macros/s/AKfycby85JNA47vSlWqSfBT9cBb8YOZbGStIP4D295UUDRy58gJKWNA6OzyidTMwbuzJyA7u/exec?action=listBoards"; // 예시

// 값이 객체면 빈 문자열로 변환하는 함수
function safeText(val) {
  if (val === undefined || val === null) return "";
  if (typeof val === "object") return "";
  return String(val);
}

export default function App() {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. 보드 목록 불러오기
  useEffect(() => {
    setLoading(true);
    fetch(BOARD_LIST_API)
      .then(res => res.json())
      .then(data => {
        console.log("보드 데이터:", data);
        setBoards(data.filter(b => b.latestUrl && b.latestUrl.startsWith("http")));
        setLoading(false);
      })
      .catch((err) => {
        console.log("보드 fetch 에러:", err);
        setLoading(false);
      });
  }, []);

  // 2. 보드 선택 시 문서 리스트 불러오기
  const fetchDocs = (webappUrl) => {
    setLoading(true);
    fetch(`${webappUrl}?action=list`)
      .then(res => res.json())
      .then(data => {
        console.log("문서 리스트 데이터:", data);
        setDocs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("문서 리스트 fetch 에러:", err);
        setLoading(false);
      });
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  // 3. 문서 상세 화면
  if (selectedDoc) {
    console.log("문서 상세 selectedDoc:", selectedDoc);
    return (
      <ScrollView style={styles.container}>
        <Button title="← 목록으로" onPress={() => setSelectedDoc(null)} />
        <View style={styles.card}>
          <Text style={styles.bold}>{safeText(selectedDoc.docName)}</Text>
          <Text>작성자: {safeText(selectedDoc.author)}</Text>
          <Text>타임스탬프: {safeText(selectedDoc.timestamp)}</Text>
          <Text>내용1: {safeText(selectedDoc.content1)}</Text>
          <Text>내용2: {safeText(selectedDoc.content2)}</Text>
          <Text>내용3: {safeText(selectedDoc.content3)}</Text>
          <Text>내용4: {safeText(selectedDoc.content4)}</Text>
          <Text>팀장: {safeText(selectedDoc.teamLeaderSign)}</Text>
          <Text>검토자: {safeText(selectedDoc.reviewerSign)}</Text>
          <Text>대표자: {safeText(selectedDoc.ceoSign)}</Text>
        </View>
        <Button title="서명하기" onPress={() => Linking.openURL(selectedDoc.signUrl)} />
      </ScrollView>
    );
  }

  // 4. 문서 리스트 화면
  if (selectedBoard) {
    return (
      <View style={styles.container}>
        <Button title="← 보드 선택으로" onPress={() => { setSelectedBoard(null); setDocs([]); }} />
        <Text style={styles.title}>{safeText(selectedBoard.boardName)} 문서 리스트</Text>
        <FlatList
          data={docs}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedDoc(item)}>
              <View style={styles.card}>
                <Text style={styles.bold}>{safeText(item.docName)}</Text>
                <Text>작성자: {safeText(item.author)}</Text>
                <Text>타임스탬프: {safeText(item.timestamp)}</Text>
                <Text>내용: {safeText(item.content1)} {safeText(item.content2)} {safeText(item.content3)} {safeText(item.content4)}</Text>
                <Text>팀장: {safeText(item.teamLeaderSign)} / 검토자: {safeText(item.reviewerSign)} / 대표자: {safeText(item.ceoSign)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // 5. 보드 선택 화면
  return (
    <View style={styles.container}>
      <Text style={styles.title}>보드 선택</Text>
      <FlatList
        data={boards}
        keyExtractor={item => item.boardName}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              setSelectedBoard(item);
              fetchDocs(item.latestUrl);
            }}
          >
            <Text style={styles.bold}>{item.boardName}</Text>
            <Text style={styles.linkText}>{item.latestUrl}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", paddingTop: 40 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  card: { backgroundColor: "#fff", margin: 8, borderRadius: 10, padding: 16, elevation: 2 },
  bold: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  linkText: { color: "#1976d2", marginTop: 4 },
});
