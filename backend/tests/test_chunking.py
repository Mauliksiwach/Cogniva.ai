import pytest
from app.services.chunking_service import chunking_service
from app.services.retrieval_service import retrieval_service
from app.services.document_service import document_service

def test_chunking_service_basic():
    sample_pages = [
        {
            "page_number": 1,
            "text": "Chapter 1: Operating Systems.\n\nAn operating system manages computer hardware and software resources. It acts as an intermediary between user programs and computer hardware.\n\nKey functions include process management, memory management, and file systems."
        },
        {
            "page_number": 2,
            "text": "Virtual Memory Overview.\n\nVirtual memory provides an idealized abstraction of the storage resources. It allows processes to have contiguous address spaces and enables paging."
        }
    ]

    chunks = chunking_service.chunk_document_pages(
        document_id="doc_test_1",
        user_id="user_test_1",
        pages=sample_pages
    )

    assert len(chunks) >= 2
    assert chunks[0].page_number == 1
    assert "operating system" in chunks[0].content.lower()
    assert chunks[0].char_count > 0
    assert chunks[0].token_count > 0

def test_retrieval_ranking():
    sample_pages = [
        {
            "page_number": 1,
            "text": "The TCP/IP stack consists of four layers: Link Layer, Internet Layer, Transport Layer, and Application Layer. TCP provides reliable ordered delivery."
        },
        {
            "page_number": 2,
            "text": "DNS (Domain Name System) translates human friendly domain names like google.com into numerical IP addresses like 142.250.190.46."
        }
    ]

    # Register document in document_service
    document_service._documents["doc_net_1"] = {
        "id": "doc_net_1",
        "user_id": "user_net_1",
        "title": "Computer Networks 101"
    }

    # Index pages
    retrieval_service.index_document("doc_net_1", "user_net_1", sample_pages)

    # Search for TCP
    results = retrieval_service.retrieve_relevant_chunks(
        user_id="user_net_1",
        document_ids=["doc_net_1"],
        query="What layers exist in TCP/IP?",
        top_k=2
    )

    assert len(results) > 0
    top = results[0]
    assert top.chunk.page_number == 1
    assert "tcp" in [t.lower() for t in top.matched_terms]
    assert top.document_title == "Computer Networks 101"
